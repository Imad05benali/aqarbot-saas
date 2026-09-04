import requests

res = requests.post("http://localhost:8000/api/properties/ingest-csv", data="mock", headers={"Content-Type": "multipart/form-data"})
print("Status Code:", res.status_code)
print("Response:", res.text)
