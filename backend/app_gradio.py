import gradio as gr
import tensorflow as tf
import numpy as np
from PIL import Image

# Load the trained model
model = tf.keras.models.load_model('derma_mnist_model.h5')

# Define the labels
labels = {
    0: "Actinic keratoses and intraepithelial carcinoma / Bowen's disease",
    1: 'basal cell carcinoma',
    2: 'benign keratosis-like lesions',
    3: 'dermatofibroma',
    4: 'melanoma',
    5: 'melanocytic nevi',
    6: 'vascular lesions'
}

def predict(image):
    # Preprocess the image
    image = Image.fromarray(image.astype('uint8'), 'RGB')
    image = image.resize((28, 28))
    img_array = np.array(image)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Make prediction
    prediction = model.predict(img_array)
    predicted_class = np.argmax(prediction[0])
    predicted_label = labels[predicted_class]
    confidence = float(prediction[0][predicted_class])

    return {predicted_label: confidence}

# Create the Gradio interface
iface = gr.Interface(
    fn=predict, 
    inputs=gr.Image(), 
    outputs=gr.Label(num_top_classes=3),
    title="DermaMNIST Skin Disease Diagnosis",
    description="Upload an image of a skin lesion to get a diagnosis."
)

iface.launch()
