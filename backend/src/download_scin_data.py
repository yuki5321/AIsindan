import os
import numpy as np
import json
from datasets import load_dataset
from PIL import Image
from tqdm import tqdm
import ast
import io

def download_and_process_scin():
    """Downloads and processes the SCIN dataset."""
    
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data')
    if not os.path.exists(data_path):
        os.makedirs(data_path)

    print("Loading SCIN dataset from Hugging Face...")
    dataset = load_dataset("google/scin")
    print("Dataset loaded.")

    images = []
    labels = []
    label_map = {}
    next_label_id = 0
    error_count = 0

    print("Processing train split...")
    for example in tqdm(dataset['train']):
        try:
            if example['image_1_path'] and example['weighted_skin_condition_label']:
                # Get image
                img = example['image_1_path']
                
                # Get label
                weighted_labels = ast.literal_eval(example['weighted_skin_condition_label'])
                if not weighted_labels:
                    continue
                
                primary_label = max(weighted_labels, key=weighted_labels.get)

                # Resize and convert to numpy array
                img = img.resize((28, 28)).convert('RGB')
                img_array = np.array(img)
                
                images.append(img_array)
                
                # Add label to map if it's new
                if primary_label not in label_map:
                    label_map[primary_label] = next_label_id
                    next_label_id += 1
                
                labels.append(label_map[primary_label])

        except Exception as e:
            error_count += 1
            # print(f"Skipping an example due to error: {e}")

    print(f"Processed {len(images)} images.")
    print(f"Skipped {error_count} examples due to errors.")

    # Save the data
    print("Saving processed data...")
    np.save(os.path.join(data_path, 'X_scin.npy'), np.array(images))
    np.save(os.path.join(data_path, 'y_scin.npy'), np.array(labels))

    # Save the label map
    with open(os.path.join(data_path, 'scin_label_map.json'), 'w') as f:
        json.dump(label_map, f)
        
    print("SCIN dataset processed and saved successfully.")

if __name__ == '__main__':
    download_and_process_scin()