import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import List, Dict, Any
import json

from .pdf_parser import chunk_text

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

def generate_response(prompt_text: str) -> str:
    if not API_KEY:
        return "Error: La clave de API de Google no está configurada."
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
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

def get_full_report_content(full_text: str, annotations: List[Dict[str, Any]], professor_notes: Dict[str, Any], specific_results: List[Dict[str, Any]]) -> str:
    # Formateamos los datos para que la IA los entienda
    annotations_text = "\n".join([f"- En el paso '{ann.get('step', 'N/A')}': {ann.get('text', '')}" for ann in annotations if ann.get('text')])
    professor_notes_text = professor_notes.get('text', 'No se añadieron notas escritas.')

    # Convertimos los dibujos (que vendrán como base64) a un simple indicador para la IA
    professor_drawing = "[Se adjunta una anotación a mano]" if professor_notes.get('drawing') else "No hay."
    annotations_drawing_text = "\n".join([f"- En el paso '{ann.get('step', 'N/A')}': [Se adjunta una anotación a mano]" for ann in annotations if ann.get('drawing')])

    results_text = "\n".join([f"- {res.get('prompt', 'N/A')}: {res.get('value', '')}" for res in specific_results if res and res.get('value')])

    prompt = f"""
    Actúa como un científico investigador senior redactando un informe de laboratorio profesional y completo.
    El informe debe ser claro, bien estructurado y listo para ser impreso.
    Utiliza el siguiente formato estricto, usando '##' para los títulos de sección.

    **CONTEXTO COMPLETO DEL EXPERIMENTO:**

    1.  **Guion Original de la Práctica:**
        {full_text}

    2.  **Notas del Profesor (puntos clave a destacar):**
        - Notas escritas: {professor_notes_text}
        - Anotación a mano: {professor_drawing}

    3.  **Resultados Específicos Medidos (DATOS PRIMARIOS):**
        {results_text if results_text else "No se registraron resultados específicos."}

    4.  **Anotaciones Generales del Procedimiento:**
        - Notas escritas: {annotations_text if annotations_text else "No se registraron anotaciones generales."}
        - Anotaciones a mano: {annotations_drawing_text if annotations_drawing_text else "No hay."}

    ---
    **TAREA PRINCIPAL:**
    Redacta el informe completo siguiendo esta estructura:

    Informe de Laboratorio: [Extrae el título de la práctica del guion]

    ## 1. Fundamento Teórico
    (Explica de forma concisa pero completa el principio científico de la práctica).

    ## 2. Materiales y Métodos
    (Resume brevemente el procedimiento seguido, no lo copies literalmente).

    ## 3. Resultados
    (Presenta de forma clara y estructurada los 'Resultados Específicos Medidos'. Si se pueden derivar cálculos de estos datos, realízalos, muéstralos y preséntalos aquí).

    ## 4. Discusión
    (Interpreta los resultados, compáralos con la teoría esperada según el guion y discute por qué se obtuvieron esos resultados. Utiliza la información de las 'Notas del Profesor' y las 'Anotaciones Generales' para enriquecer el análisis y proponer posibles fuentes de error si los resultados son inesperados).

    ## 5. Cuestiones del Guion
    (IMPORTANTE: Revisa el 'Guion Original'. Si encuentras una sección titulada 'Cuestiones', 'Preguntas' o similar, transcribe cada pregunta y respóndela detalladamente, utilizando TODOS los datos y resultados recopilados en el experimento. Si no encuentras tal sección, omite este apartado del informe).

    ## 6. Conclusiones
    (Resume las conclusiones principales del experimento en 2-3 frases claras y directas).
    """
    return generate_response(prompt)

def solve_calculation_query(query: str) -> str:
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

# --- NUEVA FUNCIÓN PARA EL ASISTENTE ---
def get_assistant_response(query: str, practice_context: str) -> str:
    """
    Genera una respuesta de experto bioquímico. Primero busca en el contexto de la
    práctica y, si no encuentra la respuesta, utiliza su conocimiento general.
    """
    prompt = f"""
    Actúa como un científico bioquímico senior y un tutor académico experto. Tu misión es ayudar a un estudiante con sus dudas sobre una práctica de laboratorio.
    Tu base de conocimiento principal es el contexto del guion de la práctica proporcionado a continuación.

    Sigue estas reglas estrictamente:
    1.  Primero, busca la respuesta a la pregunta del estudiante únicamente dentro del **"Contexto del Guion de la Práctica"**.
    2.  Si encuentras una respuesta clara y directa en el guion, respóndela basándote **exclusivamente** en esa información.
    3.  Si la respuesta **no se encuentra** de forma explícita en el guion, indícalo claramente diciendo: "Esa información no aparece detallada en el guion, pero como experto en la materia te explico:". A continuación, proporciona la mejor respuesta posible utilizando tu conocimiento científico general.
    4.  Responde siempre de manera profesional, clara y didáctica en español.
    **5.  CRÍTICO: No utilices NUNCA formato LaTeX para las variables (ejemplo: `$V_e$`). En su lugar, escribe las variables como texto plano normal (ejemplo: Ve, Vt, Vo, Kav).**

    **Contexto del Guion de la Práctica:**
    ---
    {practice_context}
    ---

    **Pregunta del Estudiante:**
    "{query}"
    """
    return generate_response(prompt)
