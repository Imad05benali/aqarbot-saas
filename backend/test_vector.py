import os
import sys
from dotenv import load_dotenv
import importlib.util

# 1. Force loading direct path l vector_service.py
current_dir = os.path.dirname(os.path.abspath(__file__))
service_path = os.path.join(current_dir, "app", "services", "vector_service.py")

print(f"📂 Looking for service at: {service_path}")

try:
    # Importation directe via spec definition (Independent mn PYTHONPATH)
    spec = importlib.util.spec_from_file_location("vector_service", service_path)
    vector_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(vector_module)
    VectorService = vector_module.VectorService
    print("✅ VectorService imported successfully using direct module loader!")
except Exception as e:
    print(f"❌ Direct import failed: {e}")
    sys.exit(1)

load_dotenv(override=True)

print("🚀 Starting Vector Service Test...")

try:
    # 1. Test Ingestion
    print("\n1️⃣ Testing Insertion into ChromaDB...")
    test_id = "prop_101"
    test_text = "Appartement de luxe à louer à Meknès, quartier Hamria. 3 chambres, salon marocain, vue dégagée, prix 4500 DH."
    test_metadata = {"price": "4500", "sector": "Hamria", "city": "Meknès"}
    
    VectorService.insert_property(
        property_id=test_id,
        text_content=test_text,
        metadata=test_metadata
    )
    print("✅ Property successfully embedded and inserted!")

    # 2. Test Semantic Search
    print("\n2️⃣ Testing Semantic Search with Darija query...")
    query = "Appartement f blasa n9iya f Hamria m3a l-ghrof"
    print(f"🔍 Searching for: '{query}'")
    
    search_results = VectorService.search_similar_properties(query_text=query, limit=1)
    
    print("\n🎉 Search Results:")
    # Safe extracting standard dictionary array results mn ChromaDB
    docs = search_results.get('documents', [[]])
    metas = search_results.get('metadatas', [[]])
    dists = search_results.get('distances', [[]])
    
    print(f"📄 Document found: {docs[0][0] if docs and docs[0] else 'No doc'}")
    print(f"📊 Metadata: {metas[0][0] if metas and metas[0] else 'No metadata'}")
    print(f"📏 Distance: {dists[0][0] if dists and dists[0] else 'No distance'}")

except Exception as e:
    print(f"\n❌ Test Failed with Error: {e}")