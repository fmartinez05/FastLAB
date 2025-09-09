import os
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header, Response, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional
import firebase_admin
from firebase_admin import credentials, auth, firestore
import cairosvg
import base64
from io import BytesIO, StringIO

from core.pdf_parser import extract_text_from_pdf
from core.ai_processor import (
    get_practice_summary,
    get_procedure_steps,
    get_full_report_content,
    get_required_results_prompts,
    solve_calculation_query,
    get_assistant_response
)
from core.report_generator import create_professional_report

try:
    cred = credentials.Certificate("fastlab-firebase-adminsdk.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"ERROR: No se pudo inicializar Firebase Admin SDK. Error: {e}")
    db = None

app = FastAPI(title="LabNote AI Backend")

origins = [
    "http://localhost:3000",
    "https://fastlab-frontend.netlify.app",
    "https://labnote.es",
    "https://www.labnote.es",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    try:
        body = await request.json()
        print(f"--- CUERPO DE LA PETICIÓN INVÁLIDA ---")
        print(json.dumps(body, indent=2))
    except Exception as e:
        print(f"No se pudo parsear el cuerpo de la petición: {e}")
    
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is missing")
    try:
        token = authorization.split("Bearer ")[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {e}")

class CalculationQuery(BaseModel):
    query: str

class ReportDataPayload(BaseModel):
    model_config = ConfigDict(extra='ignore')
    filename: Optional[str] = None
    full_text: Optional[str] = None
    summary: Optional[str] = None
    procedure: Optional[List[str]] = None
    results_prompts: Optional[List[str]] = None
    annotations: Optional[List[Dict[str, Any]]] = []
    professor_notes: Optional[Dict[str, Any]] = {}
    specific_results: Optional[List[Dict[str, Any]]] = []
    
    # --- NUEVOS CAMPOS ---
    calculated_data: Optional[Dict[str, Any]] = {}
    standard_curve_data: Optional[List[Dict[str, float]]] = []
    standard_curve_image: Optional[str] = None

class AssistantQuery(BaseModel):
    query: str
    context: str

def convert_svg_to_base64_png(svg_string: str) -> Optional[str]:
    if not svg_string or not isinstance(svg_string, str) or not svg_string.strip().startswith('<svg'):
        return None
    try:
        png_bytes = cairosvg.svg2png(bytestring=svg_string.encode('utf-8'))
        base64_string = base64.b64encode(png_bytes).decode('utf-8')
        return f"data:image/png;base64,{base64_string}"
    except Exception as e:
        print(f"Error al convertir SVG a PNG: {e}")
        return None

@app.post("/api/analyze-pdf/")
async def analyze_pdf(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    user_uid = user['uid']
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF.")

    full_text = extract_text_from_pdf(file.file)
    if not full_text:
        raise HTTPException(status_code=500, detail="No se pudo extraer texto del PDF.")

    summary = get_practice_summary(full_text)
    procedure = get_procedure_steps(full_text)
    results_prompts = get_required_results_prompts(full_text)

    report_data = {
        "filename": file.filename,
        "full_text": full_text,
        "summary": summary,
        "procedure": procedure,
        "results_prompts": results_prompts,
        "annotations": [],
        "professor_notes": {},
        "specific_results": [],
        # --- INICIALIZAR NUEVOS CAMPOS ---
        "calculated_data": {},
        "standard_curve_data": [],
        "standard_curve_image": None,
    }

    reports_ref = db.collection('users').document(user_uid).collection('reports')
    new_report_ref = reports_ref.document()
    new_report_ref.set(report_data)

    return {**report_data, "report_id": new_report_ref.id}

@app.get("/api/reports/")
async def get_user_reports(user: dict = Depends(get_current_user)):
    user_uid = user['uid']
    reports_ref = db.collection('users').document(user_uid).collection('reports')
    reports = []
    for report_doc in reports_ref.stream():
        report_data = report_doc.to_dict()
        reports.append({
            "report_id": report_doc.id,
            "filename": report_data.get("filename", "N/A"),
            "summary": report_data.get("summary", "")
        })
    return {"reports": reports}

@app.delete("/api/reports/{report_id}")
async def delete_report(report_id: str, user: dict = Depends(get_current_user)):
    user_uid = user['uid']
    report_ref = db.collection('users').document(user_uid).collection('reports').document(report_id)

    if not report_ref.get().exists:
        raise HTTPException(status_code=404, detail="Informe no encontrado.")

    report_ref.delete()
    return {"message": "Informe borrado con éxito.", "report_id": report_id}

@app.post("/api/reports/{report_id}/generate-pdf")
async def generate_report_pdf(report_id: str, payload: ReportDataPayload, user: dict = Depends(get_current_user)):
    images = {}
    
    prof_notes_drawing_data = payload.professor_notes.get("drawing", {})
    if isinstance(prof_notes_drawing_data, dict):
        svg_data = prof_notes_drawing_data.get("svg")
        if svg_data:
            images["professor_notes_drawing"] = convert_svg_to_base64_png(svg_data)
        else:
            images["professor_notes_drawing"] = prof_notes_drawing_data.get("image")
            
    annotations_drawings = {}
    for ann in payload.annotations:
        ann_drawing_data = ann.get("drawing", {})
        if isinstance(ann_drawing_data, dict):
            svg_data = ann_drawing_data.get("svg")
            if svg_data:
                annotations_drawings[ann.get("step")] = convert_svg_to_base64_png(svg_data)
            else:
                annotations_drawings[ann.get("step")] = ann_drawing_data.get("image")
    images["annotations_drawings"] = annotations_drawings

    # --- NUEVA LÓGICA PARA LA GRÁFICA DE CALIBRADO ---
    if payload.standard_curve_image:
        images["standard_curve_image"] = payload.standard_curve_image

    report_content = get_full_report_content(
        payload.full_text,
        payload.annotations,
        payload.professor_notes,
        payload.specific_results,
        payload.calculated_data,
        payload.standard_curve_data
    )
    
    pdf_buffer = create_professional_report(report_content, images)
    return StreamingResponse(
        iter([pdf_buffer.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment;filename=informe_{report_id}.pdf"}
    )

@app.get("/api/reports/{report_id}")
async def get_report_data(report_id: str, user: dict = Depends(get_current_user)):
    user_uid = user['uid']
    report_ref = db.collection('users').document(user_uid).collection('reports').document(report_id)
    report = report_ref.get()
    if not report.exists:
        raise HTTPException(status_code=404, detail="Informe no encontrado.")
    return {**report.to_dict(), "report_id": report.id}

@app.post("/api/solve-calculation/")
async def solve_calculation(payload: CalculationQuery, user: dict = Depends(get_current_user)):
    solution = solve_calculation_query(payload.query)
    return {"solution": solution}

@app.post("/api/assistant/ask")
async def ask_assistant(payload: AssistantQuery, user: dict = Depends(get_current_user)):
    try:
        solution = get_assistant_response(payload.query, payload.context)
        return {"solution": solution}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la pregunta: {e}")

@app.post("/api/reports/{report_id}/save")
async def save_report(report_id: str, payload: ReportDataPayload, user: dict = Depends(get_current_user)):
    user_uid = user['uid']
    report_ref = db.collection('users').document(user_uid).collection('reports').document(report_id)
    if not report_ref.get().exists:
        raise HTTPException(status_code=404, detail="Informe no encontrado.")
    
    update_data = payload.model_dump(exclude_unset=True)
    report_ref.update(update_data)
    
    return {"message": "Informe actualizado con éxito.", "report_id": report_id}

# --- NUEVO ENDPOINT PARA CSV ---
@app.post("/api/reports/{report_id}/csv")
async def generate_report_csv(report_id: str, payload: ReportDataPayload, user: dict = Depends(get_current_user)):
    output = StringIO()
    
    output.write("Tipo de Dato,Parámetro,Valor\n")
    
    if payload.specific_results:
        for res in payload.specific_results:
            if res:
                prompt = res.get('prompt', '').replace('"', '""')
                value = res.get('value', '').replace('"', '""')
                output.write(f"Resultado Medido,\"{prompt}\",\"{value}\"\n")

    if payload.calculated_data:
        for key, value in payload.calculated_data.items():
            param = key.replace('"', '""')
            val_str = str(value).replace('"', '""')
            output.write(f"Resultado Calculado,\"{param}\",\"{val_str}\"\n")
            
    if payload.standard_curve_data:
        output.write("\nDatos de la Recta de Calibrado\n")
        output.write("Peso Molecular (Da),Volumen de Elución (mL)\n")
        for item in payload.standard_curve_data:
            mw = item.get('mw', '')
            ve = item.get('ve', '')
            output.write(f"{mw},{ve}\n")

    output.seek(0)
    
    return StreamingResponse(
        iter([output.read()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment;filename=datos_informe_{report_id}.csv"}
    )