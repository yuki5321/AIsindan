
import os
import numpy as np
import json
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def process_kaggle_data():
    """Processes the Kaggle dermatology dataset."""
    
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data')
    csv_path = os.path.join(data_path, 'dermatology_database_1.csv')

    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found. Please download the dataset first.")
        return

    # Load data
    df = pd.read_csv(csv_path)

    # Handle missing values in age column
    df['age'] = pd.to_numeric(df['age'], errors='coerce')
    df['age'].fillna(df['age'].mean(), inplace=True)

    # Separate features and labels
    X = df.drop('class', axis=1).values
    y = df['class'].values

    # Normalize features
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    # Create label map
    label_map = {
        1: "psoriasis",
        2: "seboreic dermatitis",
        3: "lichen planus",
        4: "pityriasis rosea",
        5: "cronic dermatitis",
        6: "pityriasis rubra pilaris"
    }

    # Save processed data
    print("Saving processed data...")
    np.save(os.path.join(data_path, 'X_kaggle.npy'), X_scaled)
    np.save(os.path.join(data_path, 'y_kaggle.npy'), y)

    with open(os.path.join(data_path, 'kaggle_label_map.json'), 'w') as f:
        json.dump(label_map, f)
        
    print("Kaggle dataset processed and saved successfully.")

if __name__ == '__main__':
    process_kaggle_data()
