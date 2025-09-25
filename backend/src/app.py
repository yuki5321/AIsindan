import os
import numpy as np
import json
import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from PIL import Image
from supabase import create_client, Client
from dotenv import load_dotenv

# Explicitly load .env from the project root
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

app = Flask(__name__)

# Temporarily allow all origins for debugging CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Supabase client initialization
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise RuntimeError("Supabase URL and Key must be set in .env file")

supabase: Client = create_client(supabase_url, supabase_key)

# Load the trained image model
model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'derma_mnist_model.h5')
model = load_model(model_path)

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
        # Fetch all disease-symptom relationships
        response = supabase.from_('disease_symptoms').select('diseases(name_en), symptoms(name_en)').execute()
        if response.data:
            for item in response.data:
                if item.get('diseases') and item.get('symptoms'):
                    disease_name = item['diseases']['name_en']
                    symptom_name = item['symptoms']['name_en']
                    if disease_name not in disease_symptom_map:
                        disease_symptom_map[disease_name] = []
                    disease_symptom_map[disease_name].append(symptom_name)
        print("Successfully loaded disease-symptom map.")
    except Exception as e:
        print(f"Error loading disease-symptom map: {e}")

@app.route('/')
def index():
    return "Derma-MNIST Image Diagnosis API is running!"

@app.route('/predict_image', methods=['POST'])
def predict_image():
    data = request.get_json()
    if 'image' not in data:
        return jsonify({'error': 'No image provided'}), 400
    
    try:
        # Decode and preprocess the image
        image_data = data['image'].split(',')[1]
        image = Image.open(io.BytesIO(base64.b64decode(image_data))).convert('RGB')
        image = image.resize((28, 28))
        img_array = np.array(image) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Make prediction
        prediction = model.predict(img_array)[0]
        
        # Get top 5 predictions
        top_k = 5
        top_indices = np.argsort(prediction)[-top_k:][::-1]
        
        results = []
        for i in top_indices:
            confidence = float(prediction[i])
            disease_name_en = MODEL_CLASS_TO_DISEASE_EN.get(i)

            if disease_name_en:
                # Fetch disease details from Supabase
                db_response = supabase.from_('diseases').select('name, name_en, overview').eq('name_en', disease_name_en).single().execute()
                if db_response.data:
                    disease_info = db_response.data
                    results.append({
                        'disease': disease_info, 
                        'confidence': confidence
                    })
                else:
                    # Fallback if not in DB
                    results.append({
                        'disease': {'name': disease_name_en, 'name_en': disease_name_en, 'overview': 'No details in DB'},
                        'confidence': confidence
                    })

        return jsonify({'results': results})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/refine_diagnosis', methods=['POST'])
def refine_diagnosis():
    data = request.get_json()
    initial_results = data.get('initial_results')
    selected_symptoms = data.get('symptoms')

    if not initial_results or not selected_symptoms:
        return jsonify({'error': 'Initial results and symptoms are required'}), 400

    boost_factor = 0.1
    refined_results = []

    for result in initial_results:
        # The 'disease' object now comes from the DB
        disease_obj = result['disease']
        disease_name_en = disease_obj['name_en']
        new_confidence = result['confidence']
        
        associated_symptoms = disease_symptom_map.get(disease_name_en, [])
        match_count = len(set(associated_symptoms) & set(selected_symptoms))
        
        if match_count > 0:
            new_confidence += match_count * boost_factor
        
        refined_results.append({
            'disease': disease_obj,
            'confidence': min(new_confidence, 1.0)
        })

    refined_results.sort(key=lambda x: x['confidence'], reverse=True)

    return jsonify({'results': refined_results})


if __name__ == '__main__':
    load_disease_symptom_map()
    app.run(debug=True, port=5000)