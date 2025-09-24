
from huggingface_hub import list_repo_files

def list_scin_files():
    """Lists the files in the google/scin dataset repository."""
    try:
        repo_files = list_repo_files(repo_id="google/scin", repo_type="dataset")
        print("Files in the google/scin dataset repository:")
        for file in repo_files:
            print(file)
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    list_scin_files()
