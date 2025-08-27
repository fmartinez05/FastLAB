from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import navy
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from io import BytesIO

def create_professional_report(content: str) -> BytesIO:
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
    
    if lines:
        story.append(Paragraph(lines[0], styles['TitleStyle']))
        story.append(Spacer(1, 0.2 * inch))

    for line in lines[1:]:
        if line.startswith('## '):
            story.append(Paragraph(line.replace('## ', ''), styles['Heading1Style']))
        elif line.strip():
            story.append(Paragraph(line, styles['Justify']))
            story.append(Spacer(1, 0.1 * inch))

    doc.build(story)
    buffer.seek(0)
    return buffer