import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import firebase_admin
from firebase_admin import credentials, auth, firestore

# --- IMPORTACIONES DEL PROYECTO ---
from core.pdf_parser import extract_text_from_pdf
from core.ai_processor import (
    get_practice_summary,
    get_procedure_steps,
    get_full_report_content,
    get_required_results_prompts,
    solve_calculation_query
)
from core.report_generator import create_professional_report

# --- CONFIGURACIÓN DE FIREBASE ---
try:
    cred = credentials.Certificate("fastlab-firebase-adminsdk.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"ERROR: No se pudo inicializar Firebase Admin SDK. Error: {e}")
    db = None

app = FastAPI(title="LabNote AI Backend")

# --- MIDDLEWARE DE CORS ---
origins = [
    "http://localhost:3000",
    "https://fastlab-frontend.netlify.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DEPENDENCIA DE AUTENTICACIÓN ---
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is missing")
    try:
        token = authorization.split("Bearer ")[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {e}")

# --- MODELOS DE DATOS ---
class CalculationQuery(BaseModel):
    query: str

# FIX: Made fields optional to prevent 422 errors on save if frontend sends incomplete data
class ReportDataPayload(BaseModel):
    filename: Optional[str] = None
    full_text: Optional[str] = None
    summary: Optional[str] = None
    procedure: Optional[List[str]] = None
    results_prompts: Optional[List[str]] = None
    annotations: Optional[List[Dict[str, Any]]] = []
    professor_notes: Optional[Dict[str, Any]] = {}
    specific_results: Optional[List[Dict[str, Any]]] = []


# --- ENDPOINTS ---
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
    report_content = get_full_report_content(
        payload.full_text,
        payload.annotations,
        payload.professor_notes,
        payload.specific_results
    )

    # Preparamos los datos de las imágenes para el generador de PDF
    images = {
        "professor_notes_drawing": payload.professor_notes.get("drawing"),
        "annotations_drawings": {ann.get("step"): ann.get("drawing") for ann in payload.annotations if ann.get("drawing")}
    }

    # Pass both text content and images to the report generator
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

@app.post("/api/reports/{report_id}/save")
async def save_report(report_id: str, payload: ReportDataPayload, user: dict = Depends(get_current_user)):
    user_uid = user['uid']
    report_ref = db.collection('users').document(user_uid).collection('reports').document(report_id)

    if not report_ref.get().exists:
        raise HTTPException(status_code=404, detail="Informe no encontrado.")

    # Use exclude_unset=True to only update fields that were actually sent by the client
    report_ref.update(payload.dict(exclude_unset=True))
    return {"message": "Informe actualizado con éxito.", "report_id": report_id}