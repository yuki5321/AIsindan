
from google.cloud import storage

def list_gcs_files(bucket_name):
    """Lists files in a public GCS bucket."""
    try:
        # Create an anonymous client.
        client = storage.Client.create_anonymous_client()

        # Get a reference to the public bucket.
        bucket = client.bucket(bucket_name=bucket_name)

        # List blobs (files) in the bucket.
        blobs = bucket.list_blobs(max_results=20)

        print(f"Files in public bucket '{bucket_name}':")
        for blob in blobs:
            print(blob.name)

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    public_bucket_name = "dx-scin-public-data"
    list_gcs_files(public_bucket_name)
