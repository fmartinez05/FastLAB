import base64
import io
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import navy
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from io import BytesIO
from typing import Dict, Any

def get_image(base64_string: str, width: float = 4.5 * inch) -> Image:
    """Decodes a base64 image string and returns a ReportLab Image object."""
    try:
        # Ensure correct padding for base64
        base64_string = base64_string.split(',')[-1]
        pad = len(base64_string) % 4
        if pad > 0:
            base64_string += "=" * (4 - pad)
        
        img_data = base64.b64decode(base64_string)
        img_buffer = io.BytesIO(img_data)
        
        img = Image(img_buffer, width=width, height=width * 0.75) # Maintain aspect ratio
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
    styles.add(ParagraphStyle(name='Justify', alignment=TA_JUSTIFY, leading=14))
    styles.add(ParagraphStyle(name='TitleStyle',
                              fontName='Helvetica-Bold',
                              fontSize=20,
                              alignment=TA_CENTER,
                              textColor=navy,
                              spaceAfter=20))
    styles.add(ParagraphStyle(name='Heading1Style',
                              fontName='Helvetica-Bold',
                              fontSize=16,
                              textColor=navy,
                              spaceBefore=12,
                              spaceAfter=6,
                              leading=20))

    story = []
    lines = content.split('\n')
    
    # Prepare image iterators
    professor_drawing = images.get('professor_notes_drawing')
    annotations_drawings_list = [img for step, img in images.get('annotations_drawings', {}).items() if img]
    
    if lines:
        story.append(Paragraph(lines[0], styles['TitleStyle']))
        story.append(Spacer(1, 0.2 * inch))

    for line in lines[1:]:
        stripped_line = line.strip()
        
        # --- LÓGICA CORREGIDA AQUÍ ---
        # Se ha añadido una comprobación para asegurar que la lista de imágenes no está vacía antes de usarla.
        
        placeholder = "[Se adjunta una anotación a mano]"
        
        # Check for professor's drawing placeholder
        if placeholder in stripped_line and professor_drawing:
            img = get_image(professor_drawing)
            if img:
                story.append(Paragraph(line.replace(placeholder, ""), styles['Justify']))
                story.append(Spacer(1, 0.1 * inch))
                story.append(img)
                story.append(Spacer(1, 0.1 * inch))
                professor_drawing = None # Ensure it's used only once
            else:
                 story.append(Paragraph(line, styles['Justify']))
        
        # Check for annotation drawings placeholder (only if the list is not empty)
        elif placeholder in stripped_line and annotations_drawings_list: # <-- ESTA ES LA COMPROBACIÓN CLAVE
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