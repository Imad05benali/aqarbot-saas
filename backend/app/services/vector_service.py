import os
from pinecone import Pinecone
from app.core.config import settings

# Initialize Pinecone
pc = Pinecone(api_key=settings.PINECONE_API_KEY) if settings.PINECONE_API_KEY else None
index = pc.Index(settings.PINECONE_INDEX_NAME) if pc else None

class VectorService:
    @staticmethod
    def insert_property(property_id: str, text_content: str, metadata: dict):
        """Indexes a new property into Pinecone"""
        if not index:
            print("VectorService: Pinecone not initialized.")
            return False
            
        # Stub: requires embeddings before inserting
        index.upsert(
            vectors=[{
                "id": str(property_id),
                "values": [0.0] * 1536,  # Placeholder for real embeddings
                "metadata": metadata
            }]
        )
        return True

    @staticmethod
    def search_similar_properties(query_text: str, limit: int = 3):
        """Searches for top matching properties in Pinecone"""
        if not index:
            return {"results": []}
            
        results = index.query(
            vector=[0.0] * 1536, # Placeholder
            top_k=limit,
            include_metadata=True
        )
        return results

    @staticmethod
    def search_properties(query_text: str, n_results: int = 5):
        return VectorService.search_similar_properties(query_text, n_results)
