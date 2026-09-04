import csv
import asyncio
from app.core.supabase import supabase
import sys

def insert_data():
    print('Reading CSV...')
    properties = []
    
    with open('housing_data.csv', 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_title = str(row.get('desc', ''))[:50] + '...' if row.get('desc') else ''
            raw_type = str(row.get('Type', 'Apartment')).strip()
            raw_city = str(row.get('City', 'Casablanca')).strip()
            
            raw_price = str(row.get('new_price', '0'))
            clean_price = ''.join(c for c in raw_price if c.isdigit() or c == '.')
            price_val = float(clean_price) if clean_price else 0.0
            
            nighberd = str(row.get('Nighberd', 'Unknown')).strip()
            
            properties.append({
                'title': raw_title or f'{raw_type} in {raw_city}',
                'new_price': price_val,
                'Nighberd': nighberd,
                'City': raw_city,
                'Type': raw_type
            })
            
            # For demonstration, limit to 5,000 properties to prevent super long waits 
            # while still heavily populating the database
            if len(properties) >= 5000:
                break
    
    print(f'Total rows to parse: {len(properties)}')
    
    # Chunk inserts
    chunk_size = 1000
    for i in range(0, len(properties), chunk_size):
        chunk = properties[i:i+chunk_size]
        try:
            supabase.table('morocco_properties').insert(chunk).execute()
            print(f'Inserted {i + len(chunk)} / {len(properties)}')
            sys.stdout.flush()
        except Exception as e:
            print(f'Error at chunk {i}: {e}')
            
insert_data()
