from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import navy, black
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from io import BytesIO
import base64

def create_professional_report(content: str, images: dict = None) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer,
                            rightMargin=inch,
                            leftMargin=inch,
                            topMargin=inch,
                            bottomMargin=inch)
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Justify', alignment=TA_JUSTIFY, leading=14))
    styles.add(ParagraphStyle(name='TitleStyle', fontName='Helvetica-Bold', fontSize=20, alignment=TA_CENTER, textColor=navy, spaceAfter=20))
    styles.add(ParagraphStyle(name='Heading1Style', fontName='Helvetica-Bold', fontSize=16, textColor=navy, spaceBefore=12, spaceAfter=6, leading=20))
    styles.add(ParagraphStyle(name='ImageCaption', fontName='Helvetica-Oblique', fontSize=9, alignment=TA_CENTER, spaceBefore=2, spaceAfter=10))

    story = []
    
    # --- Lógica para insertar imágenes ---
    def add_image_to_story(base64_string, caption_text):
        if not base64_string or not base64_string.startswith('data:image/png;base64,'):
            return
        
        try:
            # Decodificar la imagen
            img_data = base64.b64decode(base64_string.split(',')[1])
            img_buffer = BytesIO(img_data)
            
            # Crear y escalar la imagen para que quepa en la página
            img = Image(img_buffer, width=5*inch, height=3*inch, kind='proportional')
            story.append(img)
            story.append(Paragraph(caption_text, styles['ImageCaption']))
        except Exception as e:
            print(f"Error al procesar imagen para PDF: {e}")

    # --- Procesamiento del contenido ---
    lines = content.split('\n')
    
    if lines:
        story.append(Paragraph(lines[0], styles['TitleStyle']))
        story.append(Spacer(1, 0.2 * inch))

    # Variable para saber en qué sección estamos
    current_section = ""
    
    for line in lines[1:]:
        if line.startswith('## '):
            section_title = line.replace('## ', '')
            story.append(Paragraph(section_title, styles['Heading1Style']))
            current_section = section_title.lower()

            # Insertar imagen de las notas del profesor si corresponde
            if "resultados" in current_section and images and images.get("professor_notes_drawing"):
                 add_image_to_story(images["professor_notes_drawing"], "<i>Anotación a mano del profesor.</i>")

        elif line.strip():
            story.append(Paragraph(line, styles['Justify']))
            story.append(Spacer(1, 0.1 * inch))

            # Insertar imágenes de anotaciones del procedimiento si corresponde
            # (Esto es una simplificación, una lógica más robusta podría buscar el paso exacto)
            if "métodos" in current_section and images and images.get("annotations_drawings"):
                for step, drawing_b64 in images["annotations_drawings"].items():
                    add_image_to_story(drawing_b64, f"<i>Anotación a mano en el paso: '{step}'.</i>")


    doc.build(story)
    buffer.seek(0)
    return buffer