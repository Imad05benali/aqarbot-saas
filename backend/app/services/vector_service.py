import os
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

load_dotenv(override=True)

# Initialize Local ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="properties")

# Local embedding function
local_ef = embedding_functions.DefaultEmbeddingFunction()

class VectorService:
    
    @staticmethod
    def insert_property(property_id: str, text_content: str, metadata: dict):
        """Indexes a new property into ChromaDB using local default embedding"""
        collection.add(
            ids=[str(property_id)],
            documents=[text_content],
            metadatas=[metadata]
        )
        return True

    @staticmethod
    def search_similar_properties(query_text: str, limit: int = 3):
        """Searches for the top N matching properties based on local semantic search"""
        results = collection.query(
            query_texts=[query_text],
            n_results=limit
        )
        return results

    @staticmethod
    def search_properties(query_text: str, n_results: int = 5):
        """Dynamic alias to align with properties search endpoint"""
        return collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
