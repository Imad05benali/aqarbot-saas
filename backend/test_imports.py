import os
from dotenv import load_dotenv
load_dotenv()

try:
    from google import genai
    print("Successfully imported genai from google")
except ImportError as e:
    print(f"ImportError: {e}")

try:
    import google.generativeai as genai_old
    print("Successfully imported google.generativeai")
except ImportError as e:
    print(f"ImportError: {e}")
