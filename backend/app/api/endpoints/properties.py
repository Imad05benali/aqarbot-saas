from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.vector_service import VectorService
# Hna khdam b l-import dial clean instance dyalk nchane b7al sefat:
from app.core.supabase import supabase  

router = APIRouter()

class PropertyCreate(BaseModel):
    title: str
    description: str
    price: float
    sector: str
    city: str
    agency_id: int

@router.post("/ingest")
async def ingest_property(property: PropertyCreate):
    try:
        # 1. Sauvegarde f Supabase relational DB
        supabase_data = {
            "title": property.title,
            "price": property.price,
            "sector": property.sector,
            "city": property.city,
            "agency_id": property.agency_id
        }
        
        db_response = supabase.table("properties").insert(supabase_data).execute()
        
        if not db_response.data:
            raise HTTPException(status_code=400, detail="Failed to insert into Supabase")
            
        inserted_id = db_response.data[0]["id"]

        # 2. Ingestion dynamic f ChromaDB Vector Store
        text_content = f"{property.title}. {property.description}. Sector: {property.sector}, City: {property.city}."
        metadata = {
            "price": str(property.price),
            "sector": property.sector,
            "city": property.city
        }
        
        VectorService.insert_property(
            property_id=str(inserted_id),
            text_content=text_content,
            metadata=metadata
        )

        return {
            "status": "success",
            "message": "Property synced to Supabase and ChromaDB!",
            "property_id": inserted_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_properties(query: str, limit: int = 5):
    """
    Semantic search from ChromaDB + Relational Join with Supabase 
    safeguarded against non-integer IDs.
    """
    try:
        if not query:
            raise HTTPException(status_code=400, detail="Query string cannot be empty")
            
        # 1. Fetch closest matches from ChromaDB
        search_results = VectorService.search_properties(query_text=query, n_results=limit)
        
        properties_found = []
        
        if search_results and 'ids' in search_results and search_results['ids']:
            ids = search_results['ids'][0]
            distances = search_results['distances'][0] if 'distances' in search_results else []
            
            for i in range(len(ids)):
                current_id = ids[i]
                
                # CHK: Check if current_id is a valid integer string (like "6") 
                # to avoid 22P02 bigint error with formats like "prop_101"
                if not current_id.isdigit():
                    continue  # bypass test rows that are not real integers
                
                # 2. SQL Join Manual: Fetch property + agency relation from Supabase
                supabase_req = supabase.table("properties")\
                                       .select("*, agencies(*)")\
                                       .eq("id", int(current_id))\
                                       .execute()
                
                supabase_data = supabase_req.data[0] if supabase_req.data else None
                
                if supabase_data:
                    agency_info = supabase_data.get("agencies", {})
                    
                    properties_found.append({
                        "property_id": current_id,
                        "title": supabase_data.get("title"),
                        "price": supabase_data.get("price"),
                        "sector": supabase_data.get("sector"),
                        "city": supabase_data.get("city"),
                        "score_distance": distances[i] if i < len(distances) else None,
                        "agency": {
                            "id": agency_info.get("id"),
                            "name": agency_info.get("name"),
                            "email": agency_info.get("email"),
                            "phone": agency_info.get("phone")
                        }
                    })
                
        return {
            "status": "success",
            "query": query,
            "results_count": len(properties_found),
            "properties": properties_found
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))