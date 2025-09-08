// src/blog/blogContent.js
// Este archivo centraliza el contenido de todos los artículos del blog.
// Cada entrada tiene un 'slug' (usado en la URL) como clave,
// y contiene el título y el contenido en formato HTML.

export const articles = {
  // === CLUSTER: GUÍAS DE LABORATORIO Y DOCUMENTACIÓN ===

  'guia-informe-laboratorio': {
    title: 'La Guía Definitiva para Escribir un Informe de Laboratorio Perfecto',
    content: `
      <h4>Introducción: Por Qué Tu Informe de Laboratorio es Más Importante de lo que Crees</h4>
      <p>Un informe de laboratorio es mucho más que un requisito académico; es la culminación de tu trabajo experimental y la principal forma de comunicar tus descubrimientos. Un informe bien estructurado no solo demuestra tu comprensión del experimento, sino que también valida la calidad de tu trabajo y permite que otros puedan replicar tus resultados. En esta guía, desglosaremos cada sección de un informe profesional para convertir tus datos en un documento científico convincente y de alto impacto.</p>
      
      <h4>Sección 1: El Resumen (Abstract) - Tu Informe en Miniatura</h4>
      <p>El resumen es la sección más leída de tu informe. Debe ser un párrafo conciso (generalmente de 150-250 palabras) que sintetice todo el documento. Escríbelo siempre al final, pero colócalo al principio. Debe responder a cuatro preguntas clave:</p>
      <ul>
        <li><strong>Propósito:</strong> ¿Qué problema investigaste y por qué es importante?</li>
        <li><strong>Métodos:</strong> ¿Qué técnicas clave utilizaste?</li>
        <li><strong>Resultados:</strong> ¿Cuál fue tu hallazgo principal? (Sé específico y cuantitativo).</li>
        <li><strong>Conclusión:</strong> ¿Qué significa tu hallazgo en un contexto más amplio?</li>
      </ul>

      <h4>Sección 2: Introducción - Contando la Historia de tu Experimento</h4>
      <p>Aquí estableces el contexto de tu investigación. No te limites a repetir el guion de la práctica. Tu objetivo es guiar al lector desde un concepto general hasta la hipótesis específica de tu experimento.</p>
      
      <h4>Sección 3: Materiales y Métodos - La Receta de tu Ciencia</h4>
      <p>Esta sección debe ser tan detallada que cualquier otro científico pueda replicar tu experimento exactamente. Escríbela en tiempo pasado y en voz pasiva. Lista todos los reactivos, equipos y software utilizados, y describe los pasos que seguiste de forma cronológica.</p>
      
      <h4>Sección 4: Resultados - Presentando los Datos Objetivamente</h4>
      <p>En esta sección, presentas tus hallazgos sin interpretarlos. Los datos son los protagonistas. Utiliza texto descriptivo, figuras (gráficos) para mostrar tendencias y tablas para presentar datos numéricos precisos. Cada figura y tabla debe tener un título claro y una leyenda descriptiva.</p>
      
      <h4>Sección 5: Discusión - Dando Sentido a tus Hallazgos</h4>
      <p>Esta es la sección más importante. Aquí interpretas tus resultados en el contexto de lo que ya se sabía. Compara tus hallazgos con la literatura, analiza las limitaciones de tu estudio y discute las implicaciones futuras de tu trabajo.</p>
      
      <h4>Sección 6: Conclusión y Referencias</h4>
      <p>La conclusión es un párrafo final que resume la importancia de tu trabajo. En las Referencias, cita todas las fuentes que mencionaste en el texto, siguiendo un formato de citación consistente (APA, Vancouver, etc.).</p>
    `
  },
  'plantillas-informe-laboratorio': {
    title: '5 Plantillas de Informe de Laboratorio Descargables (Word y PDF)',
    content: `
      <p>¿Necesitas un punto de partida para tu próximo informe? Hemos creado 5 plantillas profesionales en formato Word y PDF, diseñadas para diferentes tipos de experimentos de bioquímica. Cada plantilla incluye la estructura correcta y consejos en cada sección para guiarte.</p>
      <p><strong>Descárgalas gratis</strong> y ahorra tiempo en el formato para centrarte en lo que de verdad importa: la ciencia.</p>
      <p><a href="/downloads/plantillas-labnote.zip" download style="font-weight: bold; color: #3182CE;">Descargar Pack de Plantillas (.zip)</a></p>
      <p><em>Para más detalles sobre cómo rellenar cada sección, no te pierdas nuestra <a href="/blog/guia-informe-laboratorio" style="color: #3182CE;">Guía Definitiva para Escribir un Informe de Laboratorio Perfecto</a>.</em></p>
    `
  },
  'anotar-resultados-experimentales': {
    title: 'Cómo Anotar Resultados Experimentales para No Perder Ningún Dato',
    content: `
      <p>El éxito de un informe reside en la calidad de las anotaciones tomadas durante el experimento. Aprende las mejores prácticas para documentar tus observaciones: utiliza un sistema de numeración claro, anota las unidades de medida en todo momento, registra cualquier desviación del protocolo y no olvides fechar cada entrada. Una buena anotación es tu mejor seguro contra el olvido y la confusión. Con herramientas como <strong>LabNote</strong>, puedes digitalizar este proceso y adjuntar fotos directamente a cada paso del procedimiento.</p>
    `
  },
  'cuaderno-digital-vs-papel': {
    title: 'Cuaderno de Laboratorio Digital (ELN) vs. Papel: ¿Cuál Gana en 2025?',
    content: `
      <p>El debate está servido. Mientras que el cuaderno de papel ha sido el estándar durante siglos, los Cuadernos de Laboratorio Electrónicos (ELN) ofrecen ventajas innegables: búsquedas instantáneas, colaboración en tiempo real, copias de seguridad automáticas y una integración perfecta con los datos. En este artículo, analizamos los pros y los contras de cada método para ayudarte a decidir cuál es el mejor para tu flujo de trabajo en el laboratorio moderno.</p>
    `
  },
  'errores-documentar-experimento': {
    title: 'Los 7 Errores Más Comunes al Documentar un Experimento (y Cómo Evitarlos)',
    content: `
      <p>Desde una sección de "Resultados" que incluye interpretación hasta una "Discusión" que simplemente repite los datos, hay errores comunes que pueden restar profesionalidad a tu informe. En este artículo, identificamos los 7 fallos más frecuentes y te damos consejos prácticos para evitarlos. Aprende a distinguir entre datos objetivos y tu interpretación subjetiva, y asegúrate de que cada sección cumple su propósito a la perfección para que tu trabajo brille.</p>
    `
  },

  // === CLUSTER: CÁLCULOS Y PREPARACIÓN DE MUESTRAS ===
  
  'calculos-disoluciones-molaridad': {
    title: 'Cálculos de Disoluciones y Molaridad: La Guía Completa con Ejemplos',
    content: `
      <h4>Introducción: Los Cálculos, la Base de la Bioquímica Experimental</h4>
      <p>En bioquímica, la precisión lo es todo. Un pequeño error en el cálculo de una concentración puede invalidar un experimento completo. En esta guía completa, te llevaremos paso a paso a través de los conceptos de molaridad, preparación de soluciones y diluciones, con fórmulas claras y ejemplos prácticos para que nunca más dudes frente a la balanza o la pipeta.</p>
      
      <h4>Cálculo 1: Cómo Preparar una Disolución a partir de un Sólido</h4>
      <p><strong>Objetivo:</strong> Preparar 500 mL de una disolución de NaCl 0.5 M.</p>
      <ol>
        <li><strong>Calcula los moles necesarios:</strong> <code>moles = Molaridad × Volumen (L) = 0.5 M × 0.5 L = 0.25 moles de NaCl</code></li>
        <li><strong>Convierte los moles a gramos:</strong> Usando el peso molecular del NaCl (58.5 g/mol), <code>gramos = 0.25 moles × 58.5 g/mol = 14.63 g de NaCl</code></li>
        <li><strong>Procedimiento:</strong> Pesa 14.63 g de NaCl, disuélvelos en un poco de agua destilada en un matraz aforado de 500 mL, y luego enrasa con agua hasta la marca de 500 mL.</li>
      </ol>
      
      <h4>Cálculo 2: Cómo Realizar una Dilución (M1V1 = M2V2)</h4>
      <p>Esta es la fórmula más importante para diluir una disolución concentrada (stock). <code>M1V1 = M2V2</code></p>
      <p><strong>Objetivo:</strong> Preparar 100 mL de HCl 1 M a partir de un stock de HCl 12 M.</p>
      <ol>
        <li><strong>Identifica tus variables:</strong> M1=12M, V1=?, M2=1M, V2=100mL.</li>
        <li><strong>Despeja V1:</strong> <code>V1 = (M2 × V2) / M1 = (1 M × 100 mL) / 12 M = 8.33 mL</code></li>
        <li><strong>Procedimiento:</strong> Mide 8.33 mL del stock de HCl 12 M y añádelos a un matraz aforado de 100 mL que contenga un poco de agua. Luego, enrasa hasta la marca de 100 mL. <em>¡Recuerda siempre añadir el ácido al agua!</em></li>
      </ol>
    `
  },
  'preparar-solucion-tampon-buffer': {
    title: 'Cómo Preparar una Solución Tampón (Buffer) Paso a Paso',
    content: `
      <p>Las soluciones tampón, o buffers, son cruciales para mantener un pH estable en los experimentos biológicos, evitando que pequeñas adiciones de ácido o base alteren drásticamente el medio. Su preparación requiere el uso de la ecuación de Henderson-Hasselbalch. En este artículo te guiamos en el cálculo de las cantidades de ácido débil y su base conjugada que necesitas, y te explicamos el procedimiento correcto para ajustar el pH final con un pH-metro, un paso fundamental para la exactitud experimental.</p>
    `
  },
  'calculadora-diluciones-en-serie': {
    title: 'Calculadora de Diluciones en Serie: Guía Práctica y Fórmula',
    content: `
      <p>Las diluciones en serie son fundamentales para crear curvas de calibración o determinar la concentración de una muestra de forma escalonada. Te explicamos el concepto de factor de dilución (ej. 1:10) y cómo aplicarlo sucesivamente para obtener concentraciones muy bajas con alta precisión. Incluimos una herramienta de calculadora interactiva para que puedas verificar tus propios cálculos antes de ir al laboratorio.</p>
      <p><em>Para repasar los conceptos básicos, visita nuestra <a href="/blog/calculos-disoluciones-molaridad" style="color: #3182CE;">Guía Completa de Cálculos de Disoluciones</a>.</em></p>
    `
  },
  'que-es-estequiometria-laboratorio': {
    title: '¿Qué es la Estequiometría y Cómo se Aplica en el Laboratorio?',
    content: `
      <p>La estequiometría es el cálculo de las relaciones cuantitativas entre reactivos y productos en una reacción química. Es la base para saber cuánto producto puedes esperar de una reacción (rendimiento teórico) o cuánto reactivo necesitas para que una reacción se complete sin desperdiciar materiales. Repasamos los conceptos de mol, masa molar y reactivo limitante con ejemplos prácticos en el contexto de la bioquímica, ayudándote a optimizar tus experimentos.</p>
    `
  },

  // === CLUSTER: TÉCNICAS Y FUNDAMENTOS ===
  
  'que-es-espectrofotometria': {
    title: '¿Qué es la Espectrofotometría y para qué se Utiliza?',
    content: `
      <p>La espectrofotometría es una de las técnicas más utilizadas en un laboratorio de bioquímica para cuantificar la concentración de una sustancia en una muestra. Se basa en la Ley de Beer-Lambert, que relaciona la absorbancia de la luz con la concentración de la molécula de interés. Te explicamos el principio de funcionamiento de un espectrofotómetro, sus componentes principales (fuente de luz, monocromador, detector) y sus aplicaciones más comunes, como la cuantificación de proteínas (método de Bradford), el seguimiento de reacciones enzimáticas o la medición del crecimiento bacteriano.</p>
    `
  },
};