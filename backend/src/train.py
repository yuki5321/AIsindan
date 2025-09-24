
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split

def train_kaggle_model():
    """Trains a new model on the Kaggle dermatology dataset."""
    
    # Load data
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data')
    X = np.load(os.path.join(data_path, 'X_kaggle.npy'))
    y = np.load(os.path.join(data_path, 'y_kaggle.npy'))

    # Adjust labels to be 0-indexed
    y = y - 1

    # Split data into training and validation sets
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # The data is already normalized, so we don't need to divide by 255.0

    # Define the model
    model = models.Sequential([
        layers.Dense(128, activation='relu', input_shape=(34,)),
        layers.Dense(64, activation='relu'),
        layers.Dense(6, activation='softmax')  # 6 classes
    ])

    # Compile the model
    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])

    # Train the model
    model.fit(X_train, y_train, epochs=10, validation_data=(X_val, y_val))

    # Save the model
    model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'kaggle_model.h5')
    model.save(model_path)

    print(f"Model saved to {model_path}")

if __name__ == '__main__':
    train_kaggle_model()
