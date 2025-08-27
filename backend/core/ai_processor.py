import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import re # Para expresiones regulares en cálculos

from .pdf_parser import chunk_text

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

document_chunks: List[str] = []
vectorizer = TfidfVectorizer()
chunk_vectors = None

def setup_knowledge_base(text: str):
    global document_chunks, vectorizer, chunk_vectors
    document_chunks = chunk_text(text)
    if not document_chunks:
        return
    vectorizer = TfidfVectorizer()
    chunk_vectors = vectorizer.fit_transform(document_chunks)
    print("Base de conocimiento configurada.")

def generate_response(prompt_text: str) -> str:
    if not API_KEY:
        return "Error: La clave de API de Google no está configurada."
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt_text)
        return response.text
    except Exception as e:
        print(f"Error de IA: {e}")
        return f"Error al generar la respuesta de la IA: {e}"

def get_practice_summary(full_text: str) -> str:
    prompt = f"""
    Eres un científico bioquímico senior. Analiza este guion de prácticas:
    "{full_text}"
    Identifica el fundamento científico principal. Explícalo de forma concisa, clara y conceptual, sin detalles de procedimiento.
    """
    return generate_response(prompt)

def get_procedure_steps(full_text: str) -> List[str]:
    prompt = f"""
    Analiza el siguiente texto de un guion de laboratorio. Extrae la sección de 'Procedimiento' o 'Método'.
    Divide el procedimiento en una lista de pasos individuales y claros. Cada paso debe ser una acción concreta.
    Devuelve los pasos como una lista JSON de strings. Por ejemplo: ["Paso 1: Pesar 5g de NaCl", "Paso 2: Disolver en 100mL de agua"].

    Texto del Guion:
    {full_text}
    """
    response_text = generate_response(prompt)
    try:
        json_str = response_text[response_text.find('['):response_text.rfind(']')+1]
        steps = json.loads(json_str)
        return steps
    except:
        return [line.strip() for line in response_text.split('\n') if line.strip() and not line.startswith('```')]

def get_required_results_prompts(full_text: str) -> List[str]:
    prompt = f"""
    Analiza un guion de laboratorio para identificar todos los puntos donde se debe registrar un dato, medida u observación.
    Crea una lista de preguntas claras para pedir esos datos.
    Ejemplos: "Volumen de NaOH gastado (mL):", "Valor de absorbancia a 595 nm:", "Color final observado:".
    Devuelve únicamente una lista JSON de strings con las preguntas.

    Texto del Guion:
    {full_text}
    """
    response_text = generate_response(prompt)
    try:
        json_str = response_text[response_text.find('['):response_text.rfind(']')+1]
        prompts = json.loads(json_str)
        return prompts
    except:
        return ["Resultado principal 1:", "Resultado principal 2:", "Observaciones finales:"]

def solve_calculations(full_text: str, specific_results: List[Dict[str, Any]]) -> str:
    """
    Identifica y resuelve cálculos necesarios basados en el guion y los resultados específicos.
    """
    results_str = "\n".join([f"{res['prompt']} {res['value']}" for res in specific_results])
    
    prompt = f"""
    Eres un bioquímico experto. Analiza el siguiente guion de prácticas y los resultados obtenidos.
    Identifica si se necesitan realizar cálculos (ej. concentraciones, diluciones, factores de dilución, absorbancia a concentración).
    Si hay cálculos, plantéalos y resuélvelos paso a paso utilizando los datos proporcionados.
    Si no se necesitan cálculos explícitos, indica "No se requieren cálculos específicos basados en la información proporcionada."

    Guion de Prácticas:
    {full_text}

    Resultados Obtenidos:
    {results_str}

    Formato de la respuesta:
    ## Cálculos Realizados
    [Paso 1 del cálculo]
    [Paso 2 del cálculo]
    ...
    Resultado Final: [Valor y unidades]
    """
    return generate_response(prompt)


def get_full_report_content(full_text: str, annotations: List[Dict[str, Any]], professor_notes: Dict[str, Any], specific_results: List[Dict[str, Any]], calculated_results_text: str) -> str:
    annotations_text = "\n".join([f"- En el paso '{ann['step']}': {ann['text']}" for ann in annotations if ann.get('text')])
    professor_notes_text = professor_notes.get('text', 'No hay notas escritas.')
    results_text = "\n".join([f"- {res['prompt']}: {res['value']}" for res in specific_results if res.get('value')])

    prompt = f"""
    Actúa como un científico investigador senior redactando un informe de laboratorio profesional y completo.
    El informe debe ser claro, bien estructurado y listo para ser impreso.
    Utiliza el siguiente formato estricto, usando '##' para los títulos de sección.

    **Guion Original:**
    {full_text}

    **Notas del Profesor (puntos clave a destacar):**
    {professor_notes_text}

    **Resultados Específicos Medidos (DATOS PRIMARIOS):**
    {results_text if results_text else "No se registraron resultados específicos."}

    **Cálculos y Resultados Derivados:**
    {calculated_results_text}

    **Anotaciones Generales del Procedimiento:**
    {annotations_text if annotations_text else "No se registraron anotaciones generales."}
    ---
    **TAREA:**
    Redacta el informe completo siguiendo esta estructura:

    Informe de Laboratorio: [Extrae el título de la práctica del guion]
    ## 1. Fundamento Teórico e Introducción
    (Explica de forma concisa pero completa el principio científico de la práctica, basado en el guion).
    ## 2. Materiales y Métodos
    (Resume brevemente el procedimiento seguido. No lo copies literalmente, sintetízalo).
    ## 3. Resultados
    (ESTA ES LA SECCIÓN MÁS IMPORTANTE. Presenta de forma clara y estructurada los datos de la sección 'Resultados Específicos Medidos' y los 'Cálculos y Resultados Derivados'. Si hay datos numéricos, preséntalos en tablas si es apropiado. Si hay cálculos, muéstralos. Sé objetivo y presenta los datos tal como se midieron o calcularon).
    ## 4. Discusión y Análisis
    (Compara los resultados presentados en la sección anterior con la teoría. Interpreta los datos. Discute por qué se obtuvieron esos resultados. Integra las 'Notas del Profesor' y las 'Anotaciones Generales' si son relevantes para el análisis. Si hubo errores o resultados inesperados, analízalos y propón explicaciones científicas. Si el guion tiene preguntas en una sección de 'Cuestiones' o 'Resultados', respóndelas aquí usando los datos).
    ## 5. Conclusiones
    (Resume las conclusiones principales del experimento en 2-3 frases claras y directas, basadas en los resultados y la discusión).
    """
    
    return generate_response(prompt)

def solve_calculation_query(query: str) -> str:
    """
    Resuelve un problema de cálculo bioquímico usando la IA.
    """
    prompt = f"""
    Actúa como un científico bioquímico experto y un meticuloso asistente de laboratorio. Tu tarea es resolver el siguiente problema de cálculo.

    Sigue estos pasos estrictamente:
    1.  Identifica la fórmula o principio científico necesario para resolver el problema.
    2.  Muestra la fórmula claramente.
    3.  Asigna los valores proporcionados en el problema a las variables de la fórmula.
    4.  Muestra el cálculo paso a paso, despejando la incógnita.
    5.  Proporciona el resultado numérico final con sus unidades correctas.
    6.  Termina con una frase de "Instrucción:" clara y concisa que le diga al usuario exactamente qué debe hacer en el laboratorio.

    **Problema a resolver:** "{query}"
    """
    return generate_response(prompt)