import type { BaselineSet } from "@/lib/baseline-documents";

// Baseline governance document templates (es). Placeholders in [ ] are filled in by the organisation.
export const es: BaselineSet = {
  ai_policy: { title: "Política de IA", body: (o, sys) => `# Política de IA

## 1. Finalidad
${o} establece esta política para desarrollar, adquirir y operar sistemas de IA de forma segura, justa y transparente.

## 2. Ámbito de aplicación
Todos los sistemas de IA que la organización desarrolla, adquiere o utiliza, incluida la IA externa en modalidad SaaS. Sistemas registrados actualmente en el inventario de IA:

${sys}

## 3. Principios
- **Rendición de cuentas**: cada sistema de IA tiene un responsable designado.
- **Equidad**: se comprueba y se previene la discriminación contra grupos protegidos.
- **Transparencia**: se informa a los usuarios cuando interactúan con IA y el contenido generado se marca como tal.
- **Seguridad y protección**: los riesgos se evalúan y se prueban antes de la puesta en servicio.
- **Privacidad**: solo se utilizan los datos mínimos necesarios.
- **Supervisión humana**: las decisiones significativas son revisadas por personas.

## 4. Obligaciones
1. Todo sistema de IA se registra en el inventario de IA y se somete a una evaluación de riesgos antes de su uso.
2. Los sistemas de alto riesgo se prueban y se aprueban antes de su puesta en servicio.
3. No se introducen datos personales, datos confidenciales ni código fuente en herramientas de IA generativa sin aprobación.
4. Los incidentes de IA y los comportamientos anómalos se notifican de inmediato.
5. Los roles y responsabilidades se rigen por el documento "Roles y responsabilidades en IA (RACI)".

## 5. Cumplimiento
ISO/IEC 42001, el Reglamento de IA de la UE (AI Act), el NIST AI RMF y la Ley Básica de IA de Corea.

## 6. Revisión
Se revisa al menos una vez al año y siempre que la legislación o el negocio cambien de forma significativa.

Aprobado por: [nombre] · Vigente desde: [fecha]
` },
  roles: { title: "Roles y responsabilidades en IA (RACI)", body: (o) => `# Roles y responsabilidades en IA (RACI)

Roles y responsables de la gobernanza de la IA en ${o}. Sustituya los marcadores [ ] por las personas reales.

## 1. Roles
| Rol | Persona | Responsabilidades principales |
|---|---|---|
| Patrocinador ejecutivo de IA | [nombre] | Aprueba la política de IA, asigna recursos, revisión por la dirección |
| Responsable de gobernanza de IA | [nombre] | Inventario, riesgos y documentos; coordina la aprobación de la puesta en servicio |
| Responsable del sistema | por sistema | Registra el sistema, trata los riesgos, registra los cambios |
| Responsable de pruebas | [nombre] | Planifica y ejecuta las evaluaciones, gestiona los resultados |
| Revisor | [nombre] | Revisa los resultados de las pruebas y los documentos (independiente del autor) |
| Aprobador | [nombre] | Emite informes, aprueba la puesta en servicio y la aceptación de riesgos |
| Delegado de protección de datos | [nombre] | Evaluación de impacto relativa a la protección de datos, revisión de los tratamientos de datos |
| Responsable de seguridad de la información | [nombre] | Pruebas de seguridad, diligencia debida de seguridad de proveedores |

## 2. RACI (R responsable de la ejecución · A responsable final · C consultado · I informado)
| Actividad | Responsable de gobernanza | Responsable del sistema | Responsable de pruebas | Revisor | Aprobador |
|---|---|---|---|---|---|
| Registrar y clasificar sistemas de IA | A | R | I | I | I |
| Evaluación y tratamiento de riesgos | A | R | C | C | I |
| Pruebas y evaluación | I | C | R | A | I |
| Redactar y aprobar documentos de gobernanza | R | C | I | C | A |
| Aprobación de la puesta en servicio | R | C | C | C | A |
| Respuesta a incidentes | A | R | C | I | I |
| Diligencia debida de proveedores | A | R | I | C | I |
| Formación en alfabetización en IA | A | R | I | I | I |

## 3. Segregación de funciones
El autor y el revisor son personas distintas; quienes realizan las pruebas no aprueban sus propios resultados.
` },
  objectives: { title: "Objetivos y plan de IA", body: (o) => `# Objetivos y plan de IA

Objetivos del sistema de gestión de la IA de ${o} y cómo se alcanzan. Se revisan anualmente en la revisión por la dirección.

| Objetivo | Indicador | Meta | Responsable | Comprobación |
|---|---|---|---|---|
| Conocer todos los sistemas de IA | Tasa de registro en el inventario de IA | 100% | Responsable de gobernanza | Trimestral |
| Verificar antes de la puesta en servicio | Sistemas de alto riesgo evaluados antes de la puesta en servicio | 100% | Responsable de pruebas | En la puesta en servicio |
| Tratar los riesgos a tiempo | Riesgos tratados dentro de su plazo | ≥ 90% | Responsables de los sistemas | Mensual |
| Mantener los documentos actualizados | Documentos de gobernanza con la fecha de revisión vencida | 0 | Responsable de gobernanza | Mensual |
| Alfabetización en IA | Finalización de la formación | ≥ 95% | RR. HH. / formación | Semestral |
| Prevenir incidentes | Incidentes graves de IA | 0 | Todo el personal | Continua |

## Recursos
Las personas, el presupuesto y las herramientas (incluido K-VeriAI) necesarios para alcanzar los objetivos se asignan en la revisión por la dirección.

## Orden del día de la revisión por la dirección
Grado de consecución de los objetivos, estado de los riesgos, resultados de las pruebas, incidentes, resultados de auditoría, cambios normativos, mejoras.
` },
  risk_procedure: { title: "Procedimiento de evaluación y tratamiento de riesgos de IA", body: (o) => `# Procedimiento de evaluación y tratamiento de riesgos de IA

Cómo ${o} identifica, evalúa, trata y supervisa los riesgos de IA.

## 1. Identificación
- Los riesgos iniciales se generan a partir de las respuestas del cuestionario de alta cuando se registra un sistema.
- Los hallazgos de pruebas HIGH/CRITICAL, los incidentes y los resultados de la diligencia debida de proveedores añaden riesgos.

## 2. Evaluación
- Valorar la probabilidad (L) y la gravedad (S) de 1 a 5.
- Puntuación = (L × 1 + S × 3) ÷ 20 × 100. ≥ 80 crítico, 60–79 alto, 35–59 medio, < 35 bajo.

## 3. Tratamiento
- Elegir entre mitigar, aceptar, evitar o transferir y registrar la medida de mitigación.
- Plazos: crítico 30 días, alto 45 días, resto 90 días.
- Registrar L·S residuales tras la mitigación. La aceptación del riesgo residual la aprueba un aprobador.

## 4. Evaluación de impacto
La IA de alto riesgo / alto impacto y los sistemas que tratan datos personales se someten a una evaluación de impacto (derechos fundamentales, privacidad) antes de su puesta en servicio.

## 5. Seguimiento y reevaluación
- Los riesgos vencidos se señalan en el panel y como tareas.
- Los cambios en la versión del modelo, el prompt, las herramientas o las fuentes de datos se registran y se vuelven a ejecutar las pruebas afectadas.
` },
  records: { title: "Normas de registros y control documental de IA", body: (o) => `# Normas de registros y control documental de IA

Cómo ${o} crea, conserva y controla los documentos y registros de IA.

## 1. Ámbito de aplicación
Documentos de gobernanza (políticas, procedimientos, planes), resultados de pruebas e informes, evidencias, el registro de riesgos, registros de cambios, aprobaciones, registros de incidentes y logs del sistema.

## 2. Redacción y aprobación
- Los documentos de gobernanza se redactan en K-VeriAI "Políticas y documentos" y los aprueba un revisor distinto del autor.
- Se conservan las versiones y el historial de revisiones; cuando se aprueba una revisión, la versión anterior se conserva como "Sustituido".

## 3. Almacenamiento e integridad
- Las evidencias y los informes se conservan en el Centro de evidencias de K-VeriAI junto con el hash SHA-256 del archivo.
- Cada cambio se registra en el registro de auditoría.

## 4. Conservación
| Registro | Plazo de conservación |
|---|---|
| Documentación técnica y registros de conformidad de IA de alto riesgo | 10 años desde la introducción en el mercado |
| Logs generados automáticamente | al menos 6 meses |
| Otros documentos y registros | [plazo] |

## 5. Control de acceso
Los permisos basados en roles limitan quién puede leer y modificar los registros. Solo se comparten externamente los informes aprobados.

## 6. Revisión
Cada documento se revisa según su ciclo de revisión; una vez pasada su fecha de revisión deja de contar como evidencia.
` },
  literacy: { title: "Plan de formación en alfabetización en IA", body: (o) => `# Plan de formación en alfabetización en IA

${o} forma a todas las personas que utilizan o gestionan IA en el nivel que exige su rol.

| Destinatarios | Contenido | Cuándo | Formato |
|---|---|---|---|
| Todo el personal | Política de IA, usos permitidos y prohibidos, no introducir datos personales ni confidenciales, notificación de incidentes | Al incorporarse, anualmente | En línea |
| Responsables de sistemas | Evaluación de riesgos, registro de cambios, supervisión humana | Al ser designados, anualmente | Taller |
| Personal de pruebas y revisión | Métodos de evaluación, red teaming, criterios de valoración, sesgos | Al ser designados, anualmente | Taller |
| Dirección | Novedades normativas, rendición de cuentas, revisión por la dirección | Anualmente | Sesión informativa |

## Registros
Las listas de asistencia y las tasas de finalización se registran en el Centro de evidencias como "Registro de formación".

## Meta
Finalización ≥ 95%; quien no haya asistido recibe la formación en un plazo de 30 días.
` },
};
