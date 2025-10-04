import os
from fastapi import FastAPI, HTTPException
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Asegúrate de que tu clave API está en las variables de entorno de Render
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    # Esto nos dirá inmediatamente si la clave no está cargando
    raise RuntimeError("La variable de entorno GOOGLE_API_KEY no está configurada.")

genai.configure(api_key=API_KEY)

@app.get("/test-gemini")
async def test_gemini_endpoint():
    try:
        print("Iniciando la prueba con la API de Gemini...")
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content("Hola, esto es una prueba. Responde 'OK' si funciona.")
        print("Respuesta recibida de Gemini:", response.text)
        return {"status": "Éxito", "response": response.text}
    except Exception as e:
        # Esto nos dará el error exacto en los logs de Render
        print(f"HA OCURRIDO UN ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))