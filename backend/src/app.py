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
print(f"--- DEBUG: Looking for .env file at: {dotenv_path}")
print(f"--- DEBUG: Does .env file exist? {os.path.exists(dotenv_path)}")

load_success = load_dotenv(dotenv_path=dotenv_path)
print(f"--- DEBUG: Was .env file loaded successfully? {load_success}")

app = Flask(__name__)
CORS(app)

# Supabase client initialization
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

print(f"--- DEBUG: Value of SUPABASE_URL from env: {'Loaded' if supabase_url else 'Not Loaded'}")
print(f"--- DEBUG: Value of SUPABASE_KEY from env: {'Loaded' if supabase_key else 'Not Loaded'}")

if not supabase_url or not supabase_key:
    raise RuntimeError("Supabase URL and Key must be set in .env file")

supabase: Client = create_client(supabase_url, supabase_key)

# Load the trained image model
model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'derma_mnist_model.h5')
model = load_model(model_path)

# Define the labels for the Derma-MNIST model
labels = {
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
        # Decode the base64 image
        image_data = data['image'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        # Preprocess the image (must match training process)
        image = image.resize((28, 28))
        img_array = np.array(image)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0) # Create a batch

        # Make prediction
        prediction = model.predict(img_array)[0]
        
        # Get top 5 predictions
        top_k = 5
        top_indices = np.argsort(prediction)[-top_k:][::-1]
        
        results = []
        for i in top_indices:
            label_name = labels[i]
            confidence = float(prediction[i])
            results.append({'disease': label_name, 'confidence': confidence})

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

    # Simple boosting logic
    boost_factor = 0.1 # Add 10% confidence for each matching symptom

    refined_results = []
    for result in initial_results:
        disease_name_en = result['disease'] # Assuming the name is in English for mapping
        new_confidence = result['confidence']
        
        # Check our cached map for matching symptoms
        associated_symptoms = disease_symptom_map.get(disease_name_en, [])
        match_count = len(set(associated_symptoms) & set(selected_symptoms))
        
        # Apply boost for each match
        if match_count > 0:
            new_confidence += match_count * boost_factor
        
        refined_results.append({
            'disease': disease_name_en,
            'confidence': min(new_confidence, 1.0) # Cap confidence at 1.0
        })

    # Sort by the new confidence score
    refined_results.sort(key=lambda x: x['confidence'], reverse=True)

    return jsonify({'results': refined_results})


if __name__ == '__main__':
    load_disease_symptom_map() # Load the map on startup
    app.run(debug=True, port=5000)