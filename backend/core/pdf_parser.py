import fitz
from typing import List

def extract_text_from_pdf(file_stream) -> str:
    try:
        doc = fitz.open(stream=file_stream.read(), filetype="pdf")
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        doc.close()
        return full_text
    except Exception as e:
        print(f"Error al procesar el PDF: {e}")
        return None

def chunk_text(text: str, chunk_size: int = 2000, overlap: int = 200) -> List[str]:
    if not text:
        return []
    
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks