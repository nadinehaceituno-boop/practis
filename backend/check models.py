"""
Corre este script en tu servidor para ver qué modelos Gemini tienes disponibles:
    python3 check_models.py
"""
import os
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyCLA8WTCc70J8PupqDcsXb87eeU0kiWfoE")

print("=== Probando con google-genai (nueva SDK) ===")
try:
    from google import genai
    client = genai.Client(api_key=API_KEY)
    
    # Listar modelos disponibles
    print("\nModelos disponibles:")
    for m in client.models.list():
        if "gemini" in m.name.lower():
            print(f"  ✅ {m.name}")
    
    # Test rápido de chat
    print("\n--- Test de chat ---")
    chat = client.chats.create(model="gemini-2.0-flash")
    r = chat.send_message("di 'ok' solo")
    print(f"gemini-2.0-flash → {r.text.strip()}")

except Exception as e:
    print(f"❌ Error: {e}")

print("\n=== SDK instalada ===")
import google.genai
print(f"google-genai version: {google.genai.__version__ if hasattr(google.genai, '__version__') else 'unknown'}")