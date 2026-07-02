import pandas as pd
import re
import os

def clean_dataset():
    input_path = "housing_data.csv"
    output_path = "cleaned_housing_data.csv"
    
    if not os.path.exists(input_path):
        print(f"❌ Error: {input_path} not found.")
        return

    print(f"📂 Loading {input_path}...")
    
    # Use index_col=False to handle the leading comma which might shift columns
    # We load it first to see how it looks
    try:
        df = pd.read_csv(input_path)
    except Exception as e:
        print(f"❌ Failed to read CSV: {e}")
        return

    # 1. Clean Column Names
    # Remove leading/trailing commas, unnamed prefixes, and extra spaces
    print("🧹 Cleaning column names...")
    new_columns = []
    for col in df.columns:
        clean_col = col.strip().strip(',')
        # Remove pandas-generated 'Unnamed' if it was just a blank column due to extra comma
        if "Unnamed" in clean_col or not clean_col:
            clean_col = "drop_me"
        new_columns.append(clean_col)
    
    df.columns = new_columns
    
    # Drop columns marked for removal
    df = df.drop(columns=["drop_me"], errors="ignore")

    # 2. Clean numeric columns (new_price, surface, etc.)
    print("🔢 Cleaning numeric data...")
    numeric_targets = ["new_price", "chambres", "salles de bains", "surface", "floor"]
    
    for col in numeric_targets:
        if col in df.columns:
            # Convert to string, remove non-numeric chars, convert back to float/int
            df[col] = df[col].astype(str).apply(lambda x: re.sub(r'[^\d.]', '', x))
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            
            # Use int for counts and prices if they are whole numbers
            if col != "surface": # Keep surface as float if needed, but here we can int it
                df[col] = df[col].astype(int)

    # 3. Add auto-increment ID column at the very beginning (1-indexed)
    print("🆔 Adding Primary Key 'id'...")
    if 'id' in df.columns:
        df = df.drop(columns=['id'])
    
    df.insert(0, 'id', range(1, len(df) + 1))

    # 4. Final Sanity Check for strings
    # Ensure City and Nighberd are stripped of spaces
    for col in ["Type", "City", "Nighberd"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    # 5. Save to CSV
    print(f"💾 Saving to {output_path}...")
    df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"✅ Done! Processed {len(df)} rows.")

if __name__ == "__main__":
    clean_dataset()
