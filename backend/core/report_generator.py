import base64
import io
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import navy, black # Importamos el color negro
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from io import BytesIO
from typing import Dict, Any

# --- SI TUVIESES LOS ARCHIVOS DE LA FUENTE CORBEL (.ttf), LOS REGISTRARÍAS ASÍ ---
# from reportlab.pdfgen import pdfmetrics
# from reportlab.lib.fonts import addMapping
# pdfmetrics.registerFont(TTFont('Corbel', 'Corbel.ttf'))
# pdfmetrics.registerFont(TTFont('Corbel-Bold', 'Corbel-Bold.ttf'))
# addMapping('Corbel', 0, 0, 'Corbel')
# addMapping('Corbel', 1, 0, 'Corbel-Bold')


def get_image(base64_string: str, width: float = 4.5 * inch) -> Image:
    """Decodes a base64 image string and returns a ReportLab Image object."""
    try:
        base64_string = base64_string.split(',')[-1]
        pad = len(base64_string) % 4
        if pad > 0:
            base64_string += "=" * (4 - pad)
        
        img_data = base64.b64decode(base64_string)
        img_buffer = io.BytesIO(img_data)
        
        img = Image(img_buffer, width=width, height=width * 0.75)
        img.hAlign = 'CENTER'
        return img
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def create_professional_report(content: str, images: Dict[str, Any]) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer,
                            rightMargin=inch,
                            leftMargin=inch,
                            topMargin=inch,
                            bottomMargin=inch)
    
    styles = getSampleStyleSheet()
    
    # --- ESTILOS MODIFICADOS SEGÚN TU PETICIÓN ---
    
    # 1. Estilo para el TÍTULO
    # Font: Helvetica (similar a Corbel), Tamaño: 16, Centrado
    styles.add(ParagraphStyle(name='TitleStyle',
                              fontName='Helvetica-Bold', # Usamos Helvetica-Bold como sustituto de Corbel
                              fontSize=16,
                              alignment=TA_CENTER,
                              textColor=black,
                              spaceAfter=20))

    # 2. Estilo para los APARTADOS
    # Font: Helvetica (similar a Corbel), Tamaño: 14
    styles.add(ParagraphStyle(name='Heading1Style',
                              fontName='Helvetica-Bold', # Usamos Helvetica-Bold como sustituto de Corbel
                              fontSize=14,
                              textColor=black,
                              spaceBefore=12,
                              spaceAfter=6,
                              leading=16))
                              
    # 3. Estilo para el TEXTO normal
    # Font: Helvetica (similar a Corbel), Tamaño: 11
    styles.add(ParagraphStyle(name='Justify',
                              fontName='Helvetica', # Usamos Helvetica como sustituto de Corbel
                              fontSize=11,
                              alignment=TA_JUSTIFY,
                              textColor=black,
                              leading=14)) # Leading (interlineado) ajustado para el tamaño 11

    story = []
    lines = content.split('\n')
    
    professor_drawing = images.get('professor_notes_drawing')
    annotations_drawings_list = [img for step, img in images.get('annotations_drawings', {}).items() if img]
    
    if lines:
        # Añadimos el título y lo convertimos a MAYÚSCULAS
        title_text = lines[0].upper()
        story.append(Paragraph(title_text, styles['TitleStyle']))
        story.append(Spacer(1, 0.2 * inch))

    for line in lines[1:]:
        stripped_line = line.strip()
        placeholder = "[Se adjunta una anotación a mano]"
        
        if placeholder in stripped_line and professor_drawing:
            img = get_image(professor_drawing)
            if img:
                story.append(Paragraph(line.replace(placeholder, ""), styles['Justify']))
                story.append(Spacer(1, 0.1 * inch))
                story.append(img)
                story.append(Spacer(1, 0.1 * inch))
                professor_drawing = None
            else:
                 story.append(Paragraph(line, styles['Justify']))
        
        elif placeholder in stripped_line and annotations_drawings_list:
            img_to_add = annotations_drawings_list.pop(0) 
            img = get_image(img_to_add)
            if img:
                story.append(Paragraph(line.replace(placeholder, ""), styles['Justify']))
                story.append(Spacer(1, 0.1 * inch))
                story.append(img)
                story.append(Spacer(1, 0.1 * inch))
            else:
                 story.append(Paragraph(line, styles['Justify']))

        elif stripped_line.startswith('## '):
            story.append(Paragraph(stripped_line.replace('## ', ''), styles['Heading1Style']))
        elif stripped_line:
            story.append(Paragraph(stripped_line, styles['Justify']))
            story.append(Spacer(1, 0.1 * inch))

    doc.build(story)
    buffer.seek(0)
    return buffer