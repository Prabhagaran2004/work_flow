import requests

# ✅ WALRUS TESTNET AGGREGATOR ENDPOINT
AGGREGATOR_URL = "https://aggregator-devnet.walrus-testnet.com/v1/blobs"

def upload_file(file_path: str) -> str:
    """
    Upload a file to Walrus and return the blobId.
    """
    with open(file_path, "rb") as file:
        response = requests.put(
            AGGREGATOR_URL,
            data=file,
            headers={"Content-Type": "application/octet-stream"}
        )

    if response.status_code != 200:
        raise Exception(f"Upload failed: {response.text}")

    data = response.json()
    blob_id = data["blobId"]

    print(f"✅ File uploaded successfully!")
    print(f"Blob ID: {blob_id}\n")
    return blob_id


def retrieve_file(blob_id: str, output_path: str):
    """
    Download a file from Walrus using blobId.
    """
    retrieve_url = f"{AGGREGATOR_URL}/{blob_id}"
    response = requests.get(retrieve_url)

    if response.status_code != 200:
        raise Exception(f"Retrieve failed: {response.text}")

    with open(output_path, "wb") as file:
        file.write(response.content)

    print(f"✅ File retrieved and saved to: {output_path}")


if __name__ == "__main__":
    # 📤 1. Upload a file (make sure the file exists)
    blob_id = upload_file("hello.txt")

    # 📥 2. Download the file using blobId
    retrieve_file(blob_id, "retrieved_hello.txt")
