import os
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client
import math

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Supabase credentials (SUPABASE_URL, SUPABASE_KEY) not found in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_properties(file_path: str, chunk_size: int = 100):
    try:
        # Determine file type
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file_path)
        else:
            print("❌ ERROR: Unsupported file format. Please provide a .csv or .xlsx file.")
            return

        # 1. Clean Data
        # Strip whitespace from column headers
        df.columns = df.columns.str.strip()
        
        # Replace NaN/NaT with None for JSON/Supabase compatibility
        df = df.where(pd.notnull(df), None)

        # Ensure numeric columns are properly converted (e.g., price, size) if necessary
        # Usually Supabase handles basic casting if it's sent as primitives.
        
        records = df.to_dict(orient='records')
        total_records = len(records)
        print(f"📊 Found {total_records} records to upload.")

        # 2. Batch Upload
        success_count = 0
        for i in range(0, total_records, chunk_size):
            chunk = records[i:i + chunk_size]
            try:
                # Insert chunk into morocco_properties
                res = supabase.table("morocco_properties").insert(chunk).execute()
                success_count += len(res.data) if res.data else 0
                print(f"✅ Uploaded batch {i // chunk_size + 1} ({len(chunk)} records).")
            except Exception as batch_error:
                print(f"\n❌ BATCH ERROR: Failed at batch starting row {i}.")
                print(f"Error Details: {str(batch_error)}")
                # Optional: Identify specific row failure (if Supabase allows debug visibility)
                print(f"First row in failing batch: {chunk[0]}\n")
                
        print(f"\n🎉 Successfully uploaded {success_count} / {total_records} properties.")

    except Exception as e:
        print(f"❌ FATAL ERROR: Failed to read or process file '{file_path}'.")
        print(f"Details: {str(e)}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Upload properties to Supabase from CSV/Excel")
    parser.add_argument("file", help="Path to the .csv or .xlsx file")
    parser.add_argument("--batch", type=int, default=100, help="Batch size for Supabase inserts")
    args = parser.parse_args()
    
    upload_properties(args.file, args.batch)
