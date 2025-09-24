
import numpy as np
from medmnist import DermaMNIST
import os

def download_and_save_data():
    """Downloads the DermaMNIST dataset and saves it to the data directory."""
    
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data')
    if not os.path.exists(data_path):
        os.makedirs(data_path)

    # Download and load the training data
    train_dataset = DermaMNIST(split="train", download=True, root=data_path)

    # Download and load the validation data
    val_dataset = DermaMNIST(split="val", download=True, root=data_path)

    # Download and load the test data
    test_dataset = DermaMNIST(split="test", download=True, root=data_path)

    # Save the data as NumPy arrays
    np.save(os.path.join(data_path, 'X_train.npy'), train_dataset.imgs)
    np.save(os.path.join(data_path, 'y_train.npy'), train_dataset.labels)
    np.save(os.path.join(data_path, 'X_val.npy'), val_dataset.imgs)
    np.save(os.path.join(data_path, 'y_val.npy'), val_dataset.labels)
    np.save(os.path.join(data_path, 'X_test.npy'), test_dataset.imgs)
    np.save(os.path.join(data_path, 'y_test.npy'), test_dataset.labels)

    print("DermaMNIST dataset downloaded and saved successfully.")

if __name__ == '__main__':
    download_and_save_data()
