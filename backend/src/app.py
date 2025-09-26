import os
import numpy as np
import json
import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
# Defer TensorFlow import to runtime to reduce boot failures on Render
from PIL import Image, ImageFile
import re

# Allow loading partially truncated images instead of crashing
ImageFile.LOAD_TRUNCATED_IMAGES = True
from supabase import create_client, Client
from dotenv import load_dotenv

# Explicitly load .env from the project root
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

app = Flask(__name__)

# CORS settings
# Allow specific frontend origin if provided; fallback to wildcard
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN")
CORS(
    app,
    resources={r"/*": {"origins": FRONTEND_ORIGIN or "*"}},
    supports_credentials=False,
    allow_headers=["Content-Type"],
    methods=["GET", "POST", "OPTIONS"]
)

# Ensure CORS headers are present even on error responses (e.g., 404)
@app.after_request
def apply_cors_headers(response):
    origin = FRONTEND_ORIGIN or "*"
    response.headers.setdefault("Access-Control-Allow-Origin", origin)
    response.headers.setdefault("Access-Control-Allow-Headers", "Content-Type")
    response.headers.setdefault("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

# Supabase client initialization
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise RuntimeError("Supabase URL and Key must be set in .env file")

supabase: Client = create_client(supabase_url, supabase_key)

# Lazy-load the trained image model to avoid slow startup on Render
model = None
model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'derma_mnist_model.h5')

def get_model():
    global model
    if model is None:
        # Import TensorFlow lazily to avoid heavy startup
        from tensorflow.keras.models import load_model as _load_model
        # Load once at first actual use
        loaded = _load_model(model_path)
        model = loaded
    return model

# This mapping is now used to query the database
# The order MUST match the model's training output order.
MODEL_CLASS_TO_DISEASE_EN = {
    0: "Actinic keratoses and intraepithelial carcinoma / Bowen's disease",
    1: 'basal cell carcinoma',
    2: 'benign keratosis-like lesions',
    3: 'dermatofibroma',
    4: 'melanoma',
    5: 'melanocytic nevi',
    6: 'vascular lesions'
}

# In-memory cache for symptom and disease data to reduce DB calls
disease_symptom_map = {}

def load_disease_symptom_map():
    """Loads the mapping between diseases and symptoms from the database."""
    global disease_symptom_map
    try:
        # Fetch all disease-symptom relationships with proper joins
        response = supabase.from_('disease_symptoms').select('disease_id, symptom_id, diseases!inner(name_en), symptoms!inner(name_en)').execute()
        if response.data:
            for item in response.data:
                if item.get('diseases') and item.get('symptoms'):
                    disease_name = item['diseases']['name_en']
                    symptom_name = item['symptoms']['name_en']
                    if disease_name not in disease_symptom_map:
                        disease_symptom_map[disease_name] = []
                    disease_symptom_map[disease_name].append(symptom_name)
        print(f"Successfully loaded disease-symptom map with {len(disease_symptom_map)} diseases.")
        for disease, symptoms in disease_symptom_map.items():
            print(f"  {disease}: {symptoms}")
    except Exception as e:
        print(f"Error loading disease-symptom map: {e}")

@app.route('/')
def index():
    return "Derma-MNIST Image Diagnosis API is running!"

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'message': 'Derma-MNIST Image Diagnosis API is running!',
        'endpoints': ['/predict_image', '/refine_diagnosis']
    })

@app.route('/predict_image', methods=['POST', 'OPTIONS'])
def predict_image():
    if request.method == 'OPTIONS':
        return ("", 204)
    data = request.get_json(silent=True) or {}
    image_field = data.get('image')
    if not image_field or not isinstance(image_field, str):
        return jsonify({'error': 'No image provided or invalid format'}), 400
    
    try:
        # Decode and preprocess the image
        # Accept both Data URL (data:image/...;base64,XXXXX) and raw base64
        mime_type = None
        if image_field.startswith('data:'):
            # data URL case: data:image/png;base64,XXXX
            header, base64_part = image_field.split(',', 1)
            m = re.match(r'data:([^;]+);base64', header)
            if m:
                mime_type = m.group(1).lower()
        else:
            base64_part = image_field

        # Basic mime-type allow list if provided
        if mime_type and mime_type not in ('image/png', 'image/jpeg', 'image/jpg'):
            return jsonify({'error': f'Unsupported image mime type: {mime_type}'}), 415

        decoded_bytes = base64.b64decode(base64_part, validate=True)

        # Reject overly large payloads (e.g., > 5MB) to avoid timeouts
        if len(decoded_bytes) > 5 * 1024 * 1024:
            return jsonify({'error': 'Image too large. Please upload a smaller image.'}), 413

        image = Image.open(io.BytesIO(decoded_bytes)).convert('RGB')
        image = image.resize((28, 28))
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Make prediction
        prediction = get_model().predict(img_array)[0]
        
        # Get top 5 predictions
        top_k = 5
        top_indices = np.argsort(prediction)[-top_k:][::-1]
        
        results = []
        for i in top_indices:
            confidence = float(prediction[i])
            disease_name_en = MODEL_CLASS_TO_DISEASE_EN.get(i)

            if disease_name_en:
                # Fetch disease details from Supabase
                db_response = supabase.from_('diseases').select('id, name, name_en, overview').eq('name_en', disease_name_en).single().execute()
                if db_response.data:
                    disease_info = db_response.data
                    results.append({
                        'disease': disease_info, 
                        'confidence': confidence
                    })
                else:
                    # Fallback if not in DB
                    results.append({
                        'disease': {'id': None, 'name': disease_name_en, 'name_en': disease_name_en, 'overview': 'No details in DB'},
                        'confidence': confidence
                    })

        return jsonify({'results': results})

    except Exception as e:
        # Fail gracefully with 400 for bad image payloads
        return jsonify({'error': f'Invalid image payload: {e}'}), 400

@app.route('/refine_diagnosis', methods=['POST', 'OPTIONS'])
def refine_diagnosis():
    if request.method == 'OPTIONS':
        return ("", 204)
    data = request.get_json()
    initial_results = data.get('initial_results')
    selected_symptoms = data.get('symptoms')

    if not initial_results or not selected_symptoms:
        return jsonify({'error': 'Initial results and symptoms are required'}), 400

    # Ensure disease-symptom map is populated (gunicornでは __main__ が呼ばれないため)
    if not disease_symptom_map:
        try:
            load_disease_symptom_map()
        except Exception as _:
            # 失敗しても動作は継続（ブーストは掛からない）
            pass

    # Tuning parameters for visible impact
    boost_factor = 0.25
    refined_results = []

    # Normalize selected symptom names for robust matching
    def normalize_name(name: str) -> str:
        # lower, trim, replace spaces with underscore, drop non-alnum/underscore
        raw = (name or "").strip().lower().replace(" ", "_")
        return re.sub(r"[^a-z0-9_]", "", raw)

    # Minimal synonyms to improve matching between UI terms and DB terms
    SYMPTOM_SYNONYMS = {
        "itching": {"pruritus"},
        "dryness": {"xerosis", "dry_skin"},
        "irregular_border": {"irregular_borders", "irregular_margins"},
        "scaling": {"desquamation", "scale", "scaly_skin"},
    }

    normalized_selected = {normalize_name(s) for s in selected_symptoms}

    for result in initial_results:
        # The 'disease' object now comes from the DB
        disease_obj = result['disease']
        disease_name_en = disease_obj.get('name_en') or disease_obj.get('name_en'.upper())
        new_confidence = result['confidence']
        
        associated_symptoms = disease_symptom_map.get(disease_name_en, [])
        normalized_assoc = {normalize_name(s) for s in associated_symptoms}
        # Expand selected with synonyms
        expanded_selected = set(normalized_selected)
        for s in list(normalized_selected):
            expanded_selected |= SYMPTOM_SYNONYMS.get(s, set())
        match_count = len(normalized_assoc & expanded_selected)
        
        # Debug logging
        print(f"DEBUG: Disease={disease_name_en}")
        print(f"DEBUG: Associated symptoms={associated_symptoms}")
        print(f"DEBUG: Normalized associated={normalized_assoc}")
        print(f"DEBUG: Selected symptoms={selected_symptoms}")
        print(f"DEBUG: Normalized selected={normalized_selected}")
        print(f"DEBUG: Expanded selected={expanded_selected}")
        print(f"DEBUG: Match count={match_count}")
        print(f"DEBUG: Original confidence={result['confidence']}, New confidence={new_confidence}")
        
        if match_count > 0:
            new_confidence += match_count * boost_factor
        
        refined_results.append({
            'disease': disease_obj,
            'confidence': max(0.0, min(new_confidence, 1.0))
        })

    # Renormalize so that confidences sum to 1.0 for clearer UI changes
    total = sum(item['confidence'] for item in refined_results) or 1.0
    for item in refined_results:
        item['confidence'] = item['confidence'] / total

    refined_results.sort(key=lambda x: x['confidence'], reverse=True)

    return jsonify({'results': refined_results})


if __name__ == '__main__':
    load_disease_symptom_map()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)