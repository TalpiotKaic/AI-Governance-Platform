# Guía de usuario de K-VeriAI

A 2026-10-05 · Otros idiomas: [English](USER-GUIDE.en.md) · [한국어](USER-GUIDE.ko.md) · [Deutsch](USER-GUIDE.de.md) · [Français](USER-GUIDE.fr.md) · [Italiano](USER-GUIDE.it.md)

## 1. Para qué sirve K-VeriAI

K-VeriAI es una plataforma de gobernanza, evaluación y aseguramiento de la IA que gestiona los modelos y agentes de IA de una organización a lo largo de una sola cadena: **registrar → identificar riesgos → aplicar controles → probar y verificar → recopilar evidencias → emitir informes**. Combina las fortalezas de VerifyWise, Credo AI, OneTrust, Holistic AI e IBM watsonx.governance e implementa el diseño de evaluación de NIST AI 200-3 (ARIA Evaluation Planning Manual) de forma realmente ejecutable.

**Problemas que resuelve**

- «IA en la sombra»: nadie sabe qué sistemas de IA se usan ni dónde → el Inventario de IA y la evaluación de admisión lo registran todo.
- Nadie sabe cómo probar sistemas no deterministas como aplicaciones LLM, asistentes RAG y agentes → una biblioteca de escenarios de model testing, red teaming y user testing más un motor de ejecución automatizado.
- El uso indebido de herramientas, la exfiltración de datos y el exceso de privilegios de los agentes quedan sin control → una Agent Card (lista de herramientas permitidas, nivel de autonomía, parada de emergencia) y red teaming de agentes en entorno aislado.
- Las evidencias se preparan por separado para cada normativa → 28 controles armonizados (HC-01 a HC-28) satisfacen de una vez ISO/IEC 42001, la Ley de IA de la UE, el NIST AI RMF y la Ley marco coreana de IA.
- Los resultados de las pruebas están desconectados de las decisiones de aprobación y despliegue → las métricas de prueba actualizan automáticamente la verificación de controles, el registro de riesgos, las evidencias y el flujo de aprobación.

**Quién la usa**

| Tipo de organización | Uso |
|---|---|
| Organismo de verificación | Evalúa de forma independiente los sistemas de IA de clientes y emite informes de verificación (informes de ensayo) |
| Empresa | Gestiona la gobernanza de sus propios sistemas de IA, responde a la auditoría interna, produce paquetes de evidencias regulatorias |

**Modos de ejecución**

- **Modo DEMO**: recorre toda la cadena contra un simulador determinista sin claves API. Sirve para formación, demostración y validación del flujo; sus resultados nunca deben usarse como evidencia sobre un sistema real.
- **Modo LIVE**: llama al modelo o agente real (Anthropic, OpenAI, compatible con OpenAI, HTTP Evaluation API) y anota con un LLM-as-judge.

La interfaz y los informes están disponibles en inglés, coreano, alemán, francés, italiano y español. Cambie de idioma con el selector de banderas (**DE | EN | ES | FR | IT | KO**) en la página de inicio de sesión o en la barra superior.

## 2. Conceptos clave y flujo de trabajo

Toda función se apoya en una cadena. Registrar un sistema de IA produce riesgos, los riesgos se mitigan con controles, los controles se verifican con pruebas y los resultados de las pruebas se convierten en evidencias que van a los informes. Cuando un eslabón cambia, el resto se actualiza automáticamente.

![Cadena de gobernanza · 6 pasos, 2 bucles de retroalimentación](images/governance-chain.es.png)

Las flechas discontinuas son retroalimentaciones automáticas. Los hallazgos HIGH/CRITICAL de una prueba se inscriben en el registro de riesgos, y registrar un cambio en un sistema caduca las evidencias derivadas de pruebas y exige una nueva prueba.

**Objetos clave**

| Objeto | Significado | Dónde |
|---|---|---|
| Sistema de IA | El objeto evaluado (ML predictivo, aplicación LLM, RAG, agente, multiagente, SaaS externo). Modelos, conjuntos de datos, proveedores y Agent Card se vinculan a él | Inventario de IA |
| Riesgo | 10 dimensiones (exactitud, sesgo/equidad, robustez, seguridad física, seguridad informática, privacidad, transparencia, rendición de cuentas, comportamiento del agente, exposición). Puntuación = probabilidad×1 + gravedad×3, escalada a 100 | Registro de riesgos |
| Control armonizado (HC) | 28 controles. Un control corresponde simultáneamente a requisitos de ISO/IEC 42001, Ley de IA de la UE, NIST AI RMF y Ley marco KR | Marcos y controles |
| Método de prueba / escenario | 15 métodos con métricas, umbrales y normas de referencia; 15 escenarios con conjuntos de prompts, guiones de red teaming y cuestionarios | Biblioteca de pruebas |
| Plan de evaluación | Hojas NIST AI 200-3 B.1–B.5 (alcance, diseño, materiales, infraestructura, implementación) | Planes de evaluación |
| Ejecución de evaluación | Resultado de ejecutar un plan o escenarios contra un sistema: sesiones, diálogos, anotaciones, métricas, hallazgos | Ejecuciones de evaluación |
| Evidencia | GENERATED por pruebas, UPLOADED (documento) o ATTESTATION. Vinculada a controles y requisitos | Centro de evidencias |
| Informe | Informes de evaluación y verificación, informe ARIA, 4 paquetes de evidencias, Pasaporte de IA. Borrador → revisión → aprobación → emisión | Informes y paquetes |

**Veredictos y puntuaciones**

- Cada métrica tiene un umbral de aceptación y se juzga PASS / WARN / FAIL. WARN es la banda cercana al umbral.
- Las puntuaciones por categoría (0–100), ponderadas por gravedad (seguridad informática/seguridad física/agente 1,2, privacidad 1,1, equidad/calidad 1,0, robustez/transparencia 0,8, rendimiento 0,5), dan la **puntuación de aseguramiento de IA**: 80 o más bueno, 60–79 advertencia, menos de 60 insuficiente.
- El nivel de riesgo (LOW/MEDIUM/HIGH/CRITICAL) se fija inicialmente con las respuestas de admisión y determina el número de etapas de aprobación.

## 3. Primeros pasos

**Inicio de sesión** con la cuenta de su organización (correo y contraseña). Las sesiones duran 7 días; cierre sesión con el botón a la derecha de la barra superior.

**Idioma**: selector de banderas en la página de inicio de sesión o en la barra superior. La elección se guarda un año en el navegador. El idioma del informe se elige aparte al generarlo (por defecto, el idioma de la interfaz).

**Organización de la pantalla**

- Barra lateral izquierda: menús agrupados en Resumen, Gobernar, Evaluar y verificar, Demostrar, Administración y Público. Los menús visibles dependen de su rol (capítulo 5).
- **Pendientes**: «Pendientes», en Resumen dentro de la barra lateral, reúne lo que debe hacer ahora a partir del inventario, los riesgos, los documentos, las evaluaciones, los proveedores y las aprobaciones, lo más urgente primero (urgente, importante, si es posible). El botón de cada elemento abre la pantalla donde se realiza, y los elementos completados desaparecen automáticamente. El número junto al menú es la cantidad de elementos abiertos (en rojo si algo es urgente). Empiece aquí siempre que no sepa qué hacer a continuación.
- **Modo simple / experto**: cambie con «Simple | Experto» en la barra superior. El modo simple oculta los menús Planes de evaluación y Biblioteca de pruebas y los botones «Nuevo plan» / «Nueva evaluación» de la página del sistema; las evaluaciones se ejecutan con la «Evaluación recomendada» de un clic de cada sistema. Los administradores y probadores empiezan en modo experto, el resto en modo simple; la elección se guarda un año en el navegador. Las pantallas ocultas siguen siendo accesibles por URL.
- Barra superior: tipo de organización (organismo de verificación / empresa), selector de idioma, selector de tema (claro / oscuro / sistema — también en la página de inicio de sesión y en el menú móvil; la elección se guarda en el navegador), su nombre y rol, cierre de sesión.
- Cuerpo: título de página con descripción y acciones principales; las páginas de detalle se dividen en pestañas (resumen, métricas, hallazgos, …).
- Móvil: el botón de menú arriba a la izquierda abre los mismos menús y el selector de idioma.

**Cuentas de demostración** (contraseña `demo1234` para todas)

| Cuenta | Rol | Organización |
|---|---|---|
| admin@kveriai.demo | Administrador | K-VeriAI Verification Lab (organismo de verificación) |
| tester@kveriai.demo | Probador | K-VeriAI Verification Lab |
| reviewer@kveriai.demo | Revisor | K-VeriAI Verification Lab |
| approver@kveriai.demo | Aprobador | K-VeriAI Verification Lab |
| owner@acme.demo | Responsable de gobernanza | Acme Financial Group (empresa) |
| viewer@acme.demo | Lector | Acme Financial Group |

Los datos de demostración contienen 5 sistemas de IA (AIS-0001 a 0005), 5 ejecuciones de evaluación y una decena de informes, de modo que cada pantalla tiene contenido nada más iniciar sesión.

**Un primer recorrido de 30 minutos**

0. Abra «Pendientes» para ver qué hay que hacer (en una organización nueva aparece «Crear el conjunto documental básico»).
1. En el Panel, mire la puntuación de aseguramiento por sistema y los hallazgos abiertos.
2. En el Inventario de IA, abra AIS-0001 (agente de atención al cliente) y recorra las pestañas Agent Card, Riesgos, Controles y Evidencias.
3. En Ejecuciones de evaluación, abra una ejecución completada y revise métricas, hallazgos y diálogos de sesión.
4. Con la cuenta de probador, inicie una nueva evaluación en modo DEMO (1–2 minutos).
5. En Informes y paquetes, genere un informe de evaluación en español y descargue el PDF.

## 4. Menú por menú

Los menús se describen en el orden de la barra lateral: finalidad → organización → procedimiento → consejos.

### 4.1 Panel

Una pantalla para la situación de aseguramiento de IA de la organización. Seis mosaicos (sistemas de IA, puntuación media de aseguramiento, hallazgos abiertos, riesgos abiertos, aprobaciones pendientes, evidencias válidas), un gráfico de puntuaciones por sistema, una tendencia, los principales hallazgos abiertos, los riesgos por dimensión y las ejecuciones recientes.

- Regla de color: puntuación de aseguramiento de 80 o más verde (bueno), 60–79 ámbar (advertencia), menos de 60 rojo (insuficiente).
- La tarjeta «Pendientes» bajo los mosaicos muestra sus seis elementos más urgentes; «Ver todo» abre la lista completa.
- Consejo: para dirección y auditores, use esta pantalla junto con el informe Pasaporte de IA.

### 4.2 Inventario de IA

El registro de todos los sistemas, modelos y agentes de IA. Riesgos, controles, pruebas, evidencias e informes se vinculan a un sistema: rellene este menú primero.

**Registro (admisión)** – botón «Registrar sistema de IA»

1. Identidad y contexto: nombre, tipo de sistema (ML predictivo / aplicación LLM / RAG / agente / multiagente / SaaS externo), fase del ciclo de vida, finalidad, contexto de despliegue, regiones, usuarios previstos, personas afectadas.
2. Clasificación regulatoria y datos: categoría según la Ley de IA de la UE (mínimo, limitado, alto riesgo, prohibido, GPAI), área del anexo III (el botón ? describe los ocho ámbitos del anexo III; elija una sugerencia o escriba libremente), medidas de supervisión humana, datos personales y sensibles, orientado al cliente, decisiones automatizadas.
3. Modelo: proveedor, nombre del modelo, versión.
4. Perfil del agente (para agentes): framework, nivel de autonomía (asistencial / supervisado / autónomo), lista de herramientas (nombre | nivel de riesgo | permitido | permisos), fuentes de datos, servidores MCP, parada de emergencia, límite de presupuesto.

Al guardar, las respuestas fijan el **nivel de riesgo inicial**, generan riesgos contextuales (por ejemplo, datos personales → riesgo de privacidad, agente → riesgo de uso indebido de herramientas) y crean el **flujo de aprobación en varias etapas** acorde al nivel (técnica → privacidad y seguridad → legal → dirección).

**Vincular proveedores y conjuntos de datos** — sección 4 del formulario, página del sistema y menú «Proveedores y conjuntos de datos»

- En la sección «4. Proveedores y conjuntos de datos» del formulario, marque los proveedores y conjuntos de datos ya registrados en la organización e indique un rol (proveedor LLM, alojamiento…) o una finalidad (entrenamiento, evaluación, recuperación…). Los elementos que no existen se escriben uno por línea (nombre | rol | tipo de servicio | país / nombre | finalidad | datos personales sí·no | sensibilidad) y se crean y vinculan al guardar. Con «Vincular automáticamente el proveedor del modelo» activado, el proveedor de la sección 3 (p. ej. Anthropic) se vincula como proveedor LLM (se omite para modelos propios).
- En la página del sistema → Resumen, las tarjetas Proveedores y Conjuntos de datos permiten añadir vínculos (elegir uno existente o escribir un nombre nuevo) y quitarlos (✕). Un cambio de proveedor genera un evento de cambio y exige nuevas pruebas de seguridad/privacidad.
- Gobernar → «Proveedores y conjuntos de datos» gestiona proveedores (tipo de servicio, país, puntuación de riesgo 0–100, sensibilidad de los datos, certificaciones, notas) y conjuntos de datos (versión, origen, sensibilidad, número de registros, indicador de datos personales) y muestra qué sistemas los usan.
- **Qué se registra en Conjuntos de datos**: es un registro de «qué datos usa este sistema», no una carga de archivos. Registre los conjuntos que el sistema realmente usa — datos de entrenamiento, de evaluación, documentos que consulta el RAG, datos de negocio introducidos en inferencia — con su finalidad (entrenamiento, evaluación, recuperación, entrada de inferencia); los datos permanecen donde están. Los conjuntos de evaluación importados en la biblioteca de pruebas (4.7) se registran automáticamente; para herramientas SaaS de propósito general déjelo vacío salvo que se conecten documentos internos.
- La plantilla Excel de alta masiva tiene las columnas «Proveedores» y «Conjuntos de datos» con el mismo formato por línea. Los vínculos aparecen en las tablas de datos y terceros del AI Passport.
- **Puntuación de riesgo del proveedor**: en la «Evaluación de diligencia debida» de la tarjeta del proveedor, puntúe seis ítems de 0 (bueno) a 3 (deficiente); el resultado ponderado (0–100, mayor = más riesgo) se calcula y guarda automáticamente. Ítems y pesos: alcance del acceso a los datos 25 %, madurez de seguridad y certificaciones 20 %, gobernanza de datos y uso para entrenamiento 15 %, transparencia y documentación 15 %, jurisdicción y transferencia de datos 10 %, sustituibilidad y continuidad 15 % (según ISO/IEC 42001 A.10.3, NIST AI RMF GOVERN 6, deberes de cadena de suministro del Reglamento de IA y reglas de transferencia PIPA/RGPD). Lectura: 0–34 bajo (revisión anual), 35–59 medio (subsanación contractual, revisión semestral), 60+ alto (aprobación de la dirección, plan de salida obligatorio). Guardar una evaluación modificada crea una evidencia de diligencia debida (EV-SUP, vinculada al control HC-15) y sustituye la anterior. Un proveedor con 60+ vinculado a un sistema de alto riesgo (alto riesgo del Reglamento o nivel de alta HIGH/CRITICAL) se registra automáticamente en el registro de riesgos de ese sistema como «Vendor risk: <nombre>» (origen VENDOR, sin duplicados).
- **Perfil de sensibilidad de los datos**: marque los tipos de datos que ve el proveedor (transcripciones, identificadores de clientes, transacciones, datos de salud, biometría…), si incluye datos personales o sensibles y las condiciones de tratamiento (seudonimización, cláusula de no entrenamiento, zero retention, cifrado, región nacional, DPA…) y añada una nota. La línea de resumen aparece en los informes y en la lista de proveedores.

**Registrar herramientas de IA de propósito general** — ChatGPT, Claude, Copilot y otras IA SaaS usadas por el personal

Las herramientas que la organización no construyó también pertenecen al inventario. El uso no registrado es IA en la sombra y, según el Reglamento de IA, la organización es el **responsable del despliegue** de la herramienta.

- **Unidad de registro**: un sistema por herramienta, no por persona (p. ej. «ChatGPT (asistente personal de trabajo)»). Indique en la descripción los departamentos, el número aproximado de usuarios y el plan gratuito/de pago, y actualícela cuando cambie. Separe por uso cuando el riesgo difiera (asistencia personal frente a un chatbot para clientes basado en la misma herramienta).
- **Tipo de sistema**: elija «IA SaaS externa»; los campos mostrarán ejemplos como texto indicativo.
- **Finalidad y usos prohibidos**: indique ambos, p. ej. «borradores, resúmenes, traducción, ayuda de programación; no se usa para decisiones sobre personas ni para respuestas a clientes». Esta frase es la base de la clasificación regulatoria.
- **Categoría del Reglamento de IA**: GPAI / GPAI con riesgo sistémico son obligaciones del proveedor del modelo (OpenAI, Anthropic); no las seleccione. Clasifique según **su uso**: asistencia interna = riesgo mínimo, salidas que llegan a clientes = riesgo limitado (transparencia), uso para contratación, crédito o decisiones de RR. HH. = alto riesgo desde ese momento. Las obligaciones de transparencia y seguridad de la Ley Básica de IA de Corea también recaen en el proveedor de IA generativa; en uso interno no hay obligación directa, pero revise el etiquetado si el contenido generado llega a clientes.
- **Indicadores de datos**: si la política prohíbe introducir datos personales o sensibles, responda No; si ocurre en la práctica, responda Sí y registre los controles (prohibición de entrada, exclusión del entrenamiento, revisión trimestral) en supervisión humana. Orientado al cliente y decisión automatizada son No por hipótesis.
- **Modelo y proveedor**: proveedor OpenAI/Anthropic, nombre del modelo más reciente ofrecido, versión «SaaS, actualización continua». Deje activado «vincular automáticamente el proveedor del modelo». El riesgo real de estas herramientas está menos en la clasificación que en la **exposición de datos y las condiciones del proveedor** (uso para entrenamiento, conservación, transferencia internacional, DPA); complete la evaluación de diligencia debida y el perfil de sensibilidad de datos en la página del proveedor. Las cuentas gratuitas personales puntuarán alto: esa es la evidencia para pasar a planes Team/Enterprise o emitir una política de uso.
- **Política e importación masiva**: registre una «Política de uso de IA generativa» (usos permitidos, entradas prohibidas, requisitos de cuenta, deber de revisión) en Políticas y vincúlela; recoja el uso mediante una encuesta por departamento y cárguelo con la importación Excel. El flujo de aprobación creado al registrar deja constancia de que ese uso fue aprobado: déjelo seguir su curso.

**Alta masiva desde Excel** — botón «Importar desde Excel»

Cuando hay muchos sistemas, regístrelos de una vez con la plantilla Excel estándar en lugar de uno a uno.

1. Descargar la plantilla: encabezados y listas desplegables se generan en el idioma de la interfaz. Las columnas obligatorias llevan `*` y las columnas solo para agentes tienen encabezado morado. Tipo de sistema, etapa del ciclo de vida, categoría del Reglamento de IA y nivel de autonomía son listas desplegables, igual que los campos Sí/No: no hay errores de codificación. Cada encabezado tiene una nota y la hoja `Guide` describe cada campo con un ejemplo.
2. Rellenar: una fila por sistema en la hoja `Systems` (hasta 500 filas). Las celdas multilínea como la lista de herramientas usan Alt+Intro.
3. Subir → validar: cada fila se muestra como Lista o Error. Las filas con errores se omiten; se avisan los nombres duplicados en el archivo y los ya registrados.
4. Confirmar: solo se registran las filas válidas. Cada sistema recibe, igual que desde el formulario, su nivel de alta, riesgos iniciales y flujo de aprobación; la importación queda en el registro de auditoría.

**Progreso y siguiente paso**: parte superior de la página del sistema

Cada sistema muestra en una fila su camino hasta el despliegue: Registrado → Proveedores y datos → Riesgos evaluados → Evaluado → Controles cumplidos → Despliegue aprobado. Los pasos completados llevan una marca de verificación, los abiertos un breve detalle (riesgos por evaluar, proporción de controles aplicables cumplidos, …); a la derecha aparecen el porcentaje completado y un único **botón «Siguiente: …»** que abre la pantalla de ese paso. Las herramientas SaaS internas de uso general (SaaS externo, no orientado al cliente, sin decisiones automatizadas, no de alto riesgo) omiten el paso de evaluación, que para ellas es opcional. Los controles se consideran cumplidos cuando al menos el 80 % de los controles aplicables están implementados o verificados.

**Evaluación recomendada (un clic)**: botón «Evaluación recomendada» en la página del sistema, tarjeta «Evaluación recomendada» en la pestaña Evaluaciones

Los escenarios de la biblioteca que se ejecutan se eligen automáticamente a partir de las respuestas de admisión y del registro de riesgos. Calidad, seguridad física, seguridad informática y robustez (más comportamiento del agente en los agentes) son la base; se añade equidad con decisiones automatizadas, clasificación de alto riesgo, salidas orientadas al cliente o un riesgo de equidad; privacidad cuando se tratan datos personales o sensibles; transparencia para sistemas orientados al cliente o de riesgo limitado. Los escenarios importados y el user testing quedan fuera (si los necesita, cree un plan a mano en modo experto). El botón crea el plan de evaluación (B.1–B.5 rellenadas; un plan por sistema, actualizado en cada uso) y abre el formulario de ejecución con él seleccionado. Elija DEMO o LIVE y pulse «Iniciar evaluación».

**Pestañas de la página de detalle**

| Pestaña | Contenido |
|---|---|
| Resumen | Datos básicos, modelos, conjuntos de datos y proveedores, puntuación de aseguramiento, si se requiere nueva prueba |
| Agent Card | Nivel de riesgo, indicador de permitido, aprobación requerida y permisos por herramienta. Las herramientas no permitidas se bloquean durante la evaluación y se registran como hallazgos si se intentan usar |
| Riesgos | Riesgos y puntuaciones de este sistema |
| Controles | Estado de implementación de los 28 controles armonizados (no iniciado, en curso, implementado, verificado, no aplicable). Derivado automáticamente (véase abajo), con una marca Auto/Manual y el motivo |
| Evaluaciones | Planes y ejecuciones de este sistema |
| Evidencias | Evidencias derivadas de pruebas, cargadas y atestadas |
| Informes | Informes y paquetes de evidencias generados |
| Cambios y aprobaciones | Etapas de aprobación del despliegue, eventos de cambio |

**Estado automático de los controles**: pestaña Controles

Los estados de los controles ya no se fijan a mano. Se derivan en este orden y se actualizan cada vez que cambian pruebas, evidencias, documentos, riesgos o datos del sistema:

1. No aplicable: controles que las respuestas de admisión descartan (HC-23 salvo en agentes, HC-25 salvo en alto riesgo, HC-26 sin datos personales o sensibles, HC-24 en modelos predictivos sin salida para usuarios, HC-07/08/21/22 en herramientas SaaS internas de uso general).
2. Verificado: las pruebas vinculadas al control se superaron. Si la última prueba no alcanzó una métrica, o un cambio registrado exige repetir la prueba: en curso.
3. Implementado: hay evidencia válida vinculada (de este sistema o de toda la organización, no vencida). HC-03 queda implementado con el registro y la clasificación en el inventario; HC-04 cuando todos los riesgos del registro se han evaluado (en curso mientras queden riesgos por evaluar).
4. En curso: un documento de gobierno que cubre el control está en borrador o en revisión.
5. En otro caso, no iniciado.

Solo si no está de acuerdo, elija «Excepción: No aplicable / Implementado / En curso / No iniciado» en la columna Actualizar e indique un **motivo obligatorio**. Las excepciones se marcan como «Manual» y quedan en el registro de auditoría; volver a «Automático» deriva de nuevo el estado. Los estados cambiados a mano antes de la derivación automática se conservan con el motivo «Fijado manualmente antes del estado automático»; revíselos y vuelva a «Automático» cuando proceda.

- Consejo: siempre que cambien la versión del modelo, los prompts, las herramientas o las fuentes de datos, registre un evento de cambio. Las evidencias derivadas de pruebas caducan y los controles vuelven a «en curso», lo que hace explícito el alcance de la nueva prueba.

### 4.3 Registro de riesgos

Una vista de cartera de los riesgos en todos los sistemas. Los riesgos se clasifican en 10 dimensiones (exactitud/eficacia, sesgo/equidad, robustez, seguridad física, seguridad informática, privacidad, transparencia/explicabilidad, rendición de cuentas, comportamiento del agente, exposición) y se puntúan por probabilidad (1–5) y gravedad (1–5).

- El mapa de calor 5×5 muestra el número de riesgos por celda. «Inherente / Residual» alterna entre la posición antes y después de la mitigación. La vista inherente cuenta los riesgos abiertos; la vista residual cuenta los abiertos y aceptados (el riesgo aceptado se sigue asumiendo). La casilla («Incluir cerrados y aceptados» o «Incluir cerrados») añade el resto, y el número excluido se indica bajo el gráfico. Los riesgos sin evaluación residual permanecen en su posición inherente en la vista residual.
- El «Resumen del registro» bajo el filtro de dimensión sigue la dimensión elegida: recuento por estado, niveles inherente → residual, estado de las acciones (vencidos, vencen en 30 días, residual aún no evaluado) y puntuación media con la reducción tras la mitigación. Niveles y medias cubren los riesgos abiertos y aceptados; los riesgos sin evaluación residual cuentan con su puntuación inherente.
- «Añadir riesgo» registra un riesgo manualmente. Los hallazgos de prueba HIGH/CRITICAL y los incidentes se registran automáticamente con su origen (TEST_FINDING, INCIDENT).
- «Editar» en una fila abre un editor debajo. Estado (identificado → evaluado → en mitigación → aceptado → cerrado), L·S inherentes, L·S residuales, plazo y mitigación se guardan juntos; las puntuaciones se calculan con la misma fórmula y se muestran mientras escribe. L y S residuales deben indicarse ambos o dejarse ambos vacíos. Pasar a «aceptado» crea la aprobación de aceptación del riesgo una sola vez, y cada cambio queda en el registro de auditoría.
- El botón «Método de cálculo» en la parte superior derecha de la tarjeta del mapa de calor abre una ventana de referencia: qué riesgos se crean con qué L/S a partir de las respuestas de admisión (tipo de sistema, categoría del Reglamento de IA, cuatro indicadores de datos), la fórmula de la puntuación (L×1 + S×3) ÷ 20 × 100 y las bandas (≥ 80 crítico, 60–79 alto, 35–59 medio), las reglas de código/estado/responsable, los riesgos añadidos por hallazgos de prueba, proveedores e incidentes, y la fórmula del nivel del sistema.
- Los riesgos creados automáticamente reciben un plazo por defecto según la puntuación (crítico 30 días, alto 45 días, otros 90 días). Los riesgos abiertos vencidos se resaltan en la columna Plazo («n días de retraso»), se listan en «Riesgos vencidos» en el panel y se crea automáticamente la tarea «Riesgo vencido R-xxxx» en Aprobaciones y tareas (se cierra al cerrar o aceptar el riesgo). Cambie la fecha con «Editar» en la columna Actualizar.
- Los riesgos abiertos existentes sin plazo se completan automáticamente (misma regla, contada desde la fecha de creación) la primera vez que se abre el panel o el registro; `pnpm tsx scripts/backfill-risk-due-dates.ts` ejecuta el mismo relleno manualmente.
- **Mitigaciones recomendadas**: los riesgos generados en la admisión incluyen una mitigación recomendada para su dimensión. Para los riesgos existentes sin ella, «Aplicar las mitigaciones recomendadas (n)» en la parte superior las rellena todas de una vez (los riesgos de hallazgos de prueba usan la recomendación del hallazgo). El campo de mitigación del editor también muestra la recomendación como sugerencia. Ajuste el texto a su situación y luego indique los L·S residuales.
- Consejo: «aceptado» es una decisión de aceptación del riesgo; gestiónela junto con el registro de aprobación en Aprobaciones y tareas.

### 4.4 Marcos y controles

Bibliotecas de requisitos de ISO/IEC 42001 (92 requisitos), Ley de IA de la UE (36), NIST AI RMF (91), NIST ARIA (5) y Ley marco coreana de IA (8), más los 28 controles armonizados (HC-01 a HC-28).

- Abra un marco para ver, por requisito, los controles armonizados y las evidencias esperadas; seleccione un sistema para calcular la **cobertura (cubierto / parcial / brecha)**.
- «Generar paquete de evidencias» abre el formulario de informe con el sistema y el marco preseleccionados.
- La tabla de controles armonizados muestra qué cláusulas satisface cada control, qué métodos de prueba lo verifican y en cuántos sistemas está verificado.
- Pase el ratón (o toque) sobre el nombre de un control (HC-xx) para ver los requisitos que cumple, agrupados por marco con número de cláusula y título. Funciona en la tabla de controles armonizados y en la pestaña «Controles» de un sistema; haga clic en el nombre del marco para abrirlo.
- Los encabezados de capítulo o cláusula con subcláusulas (p. ej. ISO 42001 «4», NIST «GOVERN 1») se valoran a través de sus subcláusulas y quedan fuera de la cobertura. Los requisitos cuyos controles asignados son todos «no aplicable» se muestran como no aplicables y se excluyen del total.
- No hay nada que mantener en esta pantalla: los estados de los controles se derivan automáticamente (4.2, «Estado automático de los controles») y las brechas se cierran siguiendo el botón «Siguiente» del sistema o la lista «Pendientes».
- Consejo: el texto de los requisitos está en `docs/framework-control-library.md` y se convierte a JSON con un script. Edite el markdown, no el JSON.

### 4.5 Planes de evaluación (Evaluar y verificar)

Rellene las hojas B.1–B.5 del manual ARIA NIST AI 200-3. Un plan selecciona escenarios de la biblioteca y es la unidad desde la que se lanzan las ejecuciones.

| Hoja | Contenido |
|---|---|
| B.1 Alcance | Aplicaciones evaluadas, sector, casos de uso previstos, concepto objetivo (ligado a una característica de confiabilidad del NIST) |
| B.2 Diseño | Objetivos del model testing, red teaming y user testing; distribución de probadores (intra / entresujetos / mixto) |
| B.3 Materiales | Selección de escenarios (filas aplicables al tipo de sistema resaltadas), componentes capturados por los prompts, esquema de anotación, instrucciones |
| B.4 Infraestructura | Herramienta de anotación, herramienta de puntuación, Evaluation API / adaptador de destino |
| B.5 Implementación | Muestras de red teamers, probadores usuarios y anotadores; recogida de datos (comité ético, consentimiento, almacenamiento); técnicas de análisis; resultados comunicados |

- En la mayoría de los casos, la «Evaluación recomendada» del sistema (4.2) crea este plan por usted, así que no necesita redactarlo. El modo simple oculta este menú.
- «Ejecutar este plan» en la página del plan abre el formulario de ejecución con los escenarios preseleccionados.
- «Informe ARIA» convierte el plan y su última ejecución en un informe con formato B.1–B.5.
- Consejo: para red teaming o user testing con personas, complete los apartados de comité ético/consentimiento de B.5 antes de ejecutar.

### 4.6 Ejecuciones de evaluación

La pantalla central: ejecutar escenarios de model testing, red teaming y user testing contra un destino y acumular resultados.

**Iniciar una ejecución**

1. Elija el sistema, nombre la ejecución, registre la versión del modelo y del prompt (para el registro del entorno).
2. Seleccione escenarios: un plan o escenarios marcados directamente.
3. Elija el modo.
    - DEMO: ajuste solo el perfil de debilidad (0 = robusto … 1 = muy débil) y una semilla. Los resultados son reproducibles.
    - LIVE: elija el adaptador de destino (Anthropic / OpenAI / compatible con OpenAI / HTTP Evaluation API), el modelo, la URL base, la clave API (pueden usarse credenciales guardadas), el prompt de sistema del destino, el adaptador y el modelo del juez.
4. «Iniciar evaluación»: la página de progreso se actualiza mientras las sesiones se ejecutan, anotan y puntúan en segundo plano.

**Pestañas de la página de ejecución**

| Pestaña | Contenido |
|---|---|
| Resumen | Puntuación de aseguramiento de IA, puntuaciones por categoría, resultados por escenario, entorno de prueba |
| Métricas | Valor medido frente a umbral de aceptación por métrica, PASS/WARN/FAIL |
| Hallazgos | Gravedad, categoría, extracto de evidencia, recomendación. Estado (abierto, mitigado, aceptado, falso positivo) modificable |
| Sesiones y diálogos | Registro de diálogos y llamadas a herramientas por SessionID, anotaciones. Añada anotaciones humanas para validar al juez LLM (adjudicación NIST AI 200-3 §6) |
| Evidencias e informes | Evidencias generadas por la ejecución e informes que la referencian |

- Los botones de cabecera generan directamente un informe de evaluación o de verificación, o reejecutan con los mismos ajustes.
- Al finalizar, el estado de los controles (verificado / en curso) y las evidencias se actualizan automáticamente, y los hallazgos HIGH/CRITICAL se registran como riesgos.
- Consejo: en modo LIVE, valide a mano una muestra de las anotaciones del juez LLM en la pestaña Sesiones antes de usar los resultados para decisiones de conformidad.

### 4.7 Biblioteca de pruebas

El repositorio de **métodos de prueba** estandarizados (15) y **escenarios** reutilizables (15). Es el activo que hace trazable la cadena control → requisito de prueba → método → resultado.

- Método de prueba: concepto objetivo, métricas con umbrales de aceptación, normas de referencia (ISO/IEC 42001, OWASP LLM Top 10, NIST AI 600-1, …), controles armonizados mapeados, rúbrica LLM-as-judge.
- Escenario: categoría (calidad, equidad, robustez, seguridad física, seguridad informática, privacidad, transparencia, comportamiento del agente, rendimiento), tipo de prueba (model testing, red teaming, user testing), tipos de sistema aplicables, conjunto de prompts, esquema de anotación, cuestionario.
- Incluye los ejemplos del apéndice C de NIST ARIA (Healthcare-Privacy, Manufacturing-Safety), guiones de red teaming de agentes (uso indebido de herramientas, exfiltración, manipulación multiturno) y pruebas de divulgación del art. 50 de la Ley de IA de la UE.
- Consejo: los elementos de la biblioteca se mantienen en `prisma/seed-data/library.ts`. Al añadir un escenario, mantenga sincronizadas las claves heurísticas del juez DEMO y las claves de anotación.

**Importar escenarios (JSONL)** — botón «Importar escenarios (JSONL)» en la parte superior de la biblioteca de pruebas (requiere permiso de planes)

- Suba la salida de la pista de riesgos del [Evaluation-Dataset-Generator](https://github.com/TalpiotKaic/Evaluation-Dataset-Generator) (`risk_paired.jsonl` o los archivos aplanados `risk_ko.jsonl` / `risk_en_eu.jsonl`). El archivo se valida y previsualiza en el navegador; «Importar» crea **un escenario por eje de riesgo × dominio** (p. ej. Healthcare · R3 privacidad), solo para su organización. A diferencia de la biblioteca global, otras organizaciones no los ven.
- Los ejes de riesgo se asignan al método de prueba cuyas métricas alimentan: R1 y R5 → TM-02 (contenido dañino), R2 → TM-03 (equidad), R3 → TM-04 (privacidad), R4 → TM-01 (alucinación / fidelidad), R6 → TM-06 (jailbreak) o TM-05 para inyección indirecta y extracción del system prompt, R7 → TM-15 (dependencia excesiva y límites del asesoramiento profesional, creado automáticamente en la primera importación).
- Los prompts se guardan tal como fueron redactados y nunca se traducen. El comportamiento esperado, la rúbrica MUST / MUST NOT y la respuesta de referencia llegan al juez LLM mediante el campo `expected` del prompt; los controles benignos (`benign_control`) miden el rechazo excesivo. Usted elige qué idiomas (coreano, inglés) importar.
- El archivo se inscribe automáticamente en el **registro de conjuntos de datos** (Proveedores y datos → Conjuntos de datos) como conjunto de evaluación (fuente, versión = `as_of`, número de registros, sin datos personales, interno) y los escenarios lo referencian. Aunque no elija sistemas al importar, un plan o ejecución que incluya estos escenarios **vincula el conjunto de datos al sistema con finalidad «evaluation»**, con lo que aparece en la tabla de datos del AI Passport.
- Los archivos de la pista de conocimiento (`eval_*.jsonl`, opción múltiple) aún no se pueden importar.

### 4.8 Centro de evidencias (Demostrar)

El almacén de todo artefacto que demuestra algo. Hay tres tipos.

| Origen | Descripción | Comportamiento del estado |
|---|---|---|
| GENERATED | Creada automáticamente por una ejecución, una por categoría de prueba, vinculada a los controles de los métodos usados | Caduca al registrar un cambio en el sistema |
| UPLOADED | Archivos como políticas, EIPD, model cards | Fecha de validez opcional |
| ATTESTATION | Declaración humana registrada sin archivo | Fecha de validez opcional |

- **Evidencias de toda la organización**: las evidencias registradas sin sistema y los documentos aprobados en Políticas y documentos cuentan para cada sistema. Las evidencias fuera de su vigencia vencen automáticamente y dejan de contar; las que vencen en 30 días se muestran en el panel. Redacte y apruebe los documentos de gobierno (políticas, procedimientos, funciones) en Políticas y documentos, no aquí.
- «Añadir evidencia»: elija el tipo (22 tipos: model card, evaluación de riesgos, EIPD, informe de red team, informe de auditoría, …), el sistema (en blanco para nivel de organización), la validez, la descripción, el archivo, y **vincúlela a controles armonizados**.
- Las evidencias vinculadas a controles se reutilizan automáticamente en los paquetes ISO/IEC 42001, Ley de IA de la UE, NIST AI RMF y Ley marco KR.
- En la página de detalle, cambie el estado (válida, caducada, sustituida) y vincule más controles.
- Consejo: use el filtro «Caducadas (se requiere nueva prueba)» para planificar reevaluaciones.

### 4.9 Informes y paquetes

Genere ocho tipos de informes a partir de los datos de la plataforma (ejecuciones, riesgos, controles, evidencias) y luego revíselos, apruébelos y emítalos.

| Informe | Finalidad | Entradas |
|---|---|---|
| Informe de evaluación de IA | Resumen, metodología, métricas, hallazgos, trazabilidad y limitaciones de una ejecución | Una ejecución completada |
| Informe de verificación del sistema de IA (informe de ensayo) | Informe de ensayo formal con elementos, criterios de aceptación, resultados, no conformidades y bloque de firma | Una o más ejecuciones completadas; nombres de probador / revisor / aprobador |
| Informe de evaluación NIST ARIA | Hojas B.1–B.5 y resumen de resultados | Un plan de evaluación |
| Paquetes de evidencias ISO/IEC 42001 · Ley de IA de la UE · NIST AI RMF · Ley marco KR | Matriz de cobertura de requisitos, índice de evidencias, brechas y recomendaciones, extracto de riesgos | Solo sistema |
| Pasaporte de IA | Ficha viva: identidad, datos, historial de aseguramiento, estado de controles, riesgos, cambios, documentos | Solo sistema |

**Flujo del informe**: borrador → enviar a revisión → revisado → aprobado → emitido. La emisión crea un registro de aprobación (evidencia) y marca la versión anterior como «sustituida». Un revisor puede devolver un informe a borrador.

- El formulario tiene un **idioma del informe** (inglés / coreano / alemán / francés / italiano / español). Las versiones se controlan por idioma y la página del informe ofrece «Regenerar en …» para los demás idiomas.
- La página del informe ofrece vista de impresión, descarga en PDF y exportación JSON.
- Consejo: para envíos externos use únicamente informes en estado «emitido». Solo los informes emitidos aparecen en el Centro de confianza de IA.

### 4.10 Políticas y documentos

Redacte, someta a revisión y mantenga al día en un solo lugar los documentos de gobierno de la organización: políticas, procedimientos, normas internas, funciones y responsabilidades, objetivos y planificación, planes de recursos y revisión por la dirección, y reglas de registros y control documental. Los documentos aprobados se publican automáticamente como **evidencia de toda la organización**, que cuenta para la cobertura de cada sistema de IA, y vencen automáticamente tras su fecha de revisión. Los documentos propios de un sistema (EIPD, ficha de modelo…) y los registros de actividad (resultados de pruebas, formación) van en el Centro de evidencias.

| Paso | Qué ocurre | Quién |
|---|---|---|
| 1. Borrador | En «Nuevo documento» elija tipo, versión y ciclo de revisión (3/6/12/24 meses); redacte el texto en Markdown (# títulos, - listas, \| tablas \|) y/o adjunte el archivo firmado (MD, TXT, PDF, DOCX, HWP…, máx. 10 MB). Los controles sugeridos se preseleccionan según el tipo (p. ej. funciones → HC-02). | Responsable de gobierno, admin |
| 2. Solicitud de revisión | Requiere texto o archivo. En Aprobaciones y tareas aparece la tarea «Revisión de documento solicitada». | Autor |
| 3. Aprobado · en vigor | Un revisor distinto del autor aprueba o devuelve con un comentario. La aprobación pone el documento en vigor, fija la próxima revisión (aprobación + ciclo) y crea una evidencia de la organización vinculada a los controles elegidos. | Revisor, aprobador, responsable de gobierno, admin |
| 4. Revisión periódica · nueva versión | Desde 30 días antes de la revisión, el panel y una tarea lo recuerdan. Si no cambia, «Revisado: sin cambios» amplía un ciclo; si cambia, «Nueva versión» crea una revisión que vuelve a aprobarse. Al aprobarse, la versión anterior pasa a «Sustituida» en el historial. | Revisor / autor |

- **Conjunto documental básico**: en la tarjeta «Conjunto documental básico» sobre la lista, «Crear n borrador(es)» crea seis borradores en el idioma actual de la interfaz: Política de IA (HC-01), Roles y responsabilidades en IA (RACI) (HC-02), Objetivos y plan de IA (HC-01, HC-19), Procedimiento de evaluación y tratamiento de riesgos de IA (HC-04), Normas de registros y control documental de IA (HC-12, ciclo de revisión de 24 meses) y Plan de formación en alfabetización en IA (HC-17). El nombre de su organización y su inventario de IA vienen precargados, así que solo tiene que sustituir los marcadores [ ] y solicitar la revisión. Los documentos existentes no se vuelven a crear, y la tarjeta muestra de un vistazo el estado de los seis.
- **Vencimiento**: tras la fecha de revisión, el documento y su evidencia vencen y dejan de contar; se crea la tarea «Documento vencido» para el responsable.
- **Segregación de funciones**: el autor (solicitante) no puede aprobar su propio documento. Un administrador puede, pero queda señalado «Autorrevisado».
- **Retirar**: retirar un documento sustituye su evidencia y lo conserva como registro. Los borradores pueden eliminarse.
- Los indicadores sobre la lista y los filtros muestran el estado; también la tarjeta «Documentos de gobierno y vigencia de evidencias» del panel.
- Consejo: adjunte el original firmado (PDF) y recoja lo esencial en el texto para que los auditores lo lean en pantalla.

### 4.11 Aprobaciones y tareas

Revisión y aprobación en varias etapas, tareas y pista de auditoría en una sola pantalla.

- **Aprobaciones pendientes**: etapas de aprobación del despliegue generadas a partir del nivel de admisión (revisión técnica, privacidad y seguridad, legal, dirección), aceptación de riesgos, emisión de informes. Revisores, aprobadores, responsables de gobernanza y administradores aprueban o rechazan con un comentario. Cada decisión se convierte en un registro de aprobación (evidencia) y una entrada de la pista de auditoría.
- **Tareas**: cree con título, responsable y fecha de vencimiento; actualice el estado (abierta, en curso, hecha, cancelada). Las notificaciones de incidentes y los eventos de cambio crean automáticamente tareas de reevaluación.
- **Pista de auditoría**: registro inmutable de quién hizo qué y cuándo (últimas 25 entradas), para auditoría interna y solicitudes de reguladores.
- Consejo: los lectores no ven este menú. Asigne el rol Revisor a un auditor que necesite la pista de auditoría.

### 4.12 Incidentes

Registre incidentes operativos de IA (sesgo, alucinación, privacidad, seguridad física, seguridad informática, …) y cumpla las obligaciones de vigilancia poscomercialización.

- Campos de la notificación: sistema (o nivel de organización), gravedad, categoría de daño, personas afectadas, indicador de incidente grave (art. 3, punto 49, Ley de IA de la UE), descripción.
- La notificación registra un riesgo EXPOSURE y una tarea de reevaluación. Los incidentes graves se marcan para los plazos del art. 73 de la Ley de IA de la UE y el art. 32 de la Ley marco KR.
- Seguimiento: estado (notificado → en investigación → mitigado → cerrado), causa raíz, acciones correctivas.
- Consejo: si el incidente afecta a una categoría de prueba, registre un evento de cambio en el sistema para que esa categoría entre en el alcance de la nueva prueba.

### 4.13 Configuración (Administración)

Visible para administradores y responsables de gobernanza; solo los administradores pueden modificar.

| Tarjeta | Contenido |
|---|---|
| Organización | Nombre, país, sector, Centro de confianza de IA público activado/desactivado e introducción |
| Credenciales de proveedores del modo LIVE | Claves API de Anthropic / OpenAI / compatible con OpenAI, cifradas AES-256-GCM en reposo, usadas por defecto en las ejecuciones |
| Usuarios y roles | Añadir usuarios (contraseña inicial), cambiar roles |
| Matriz de permisos | Tabla de solo lectura con las capacidades por rol |
| Integraciones | Enlace al contrato de la HTTP Evaluation API |

### 4.14 Centro de confianza de IA (público) · HTTP Evaluation API

El **Centro de confianza de IA** es una página pública (`/trust/<slug-organización>`) sin inicio de sesión. Muestra compromisos de gobernanza, número de sistemas de IA en el alcance, políticas activas, informes de aseguramiento **emitidos** e información sobre IA. Se activa o desactiva en Configuración.

La **HTTP Evaluation API** es el contrato para evaluar modelos y agentes externos en modo LIVE sin compartir credenciales. Refleja la Evaluation API de NIST AI 200-3 (OpenConnection / StartSession / GetResponse / CloseConnection): K-VeriAI envía el diálogo y el catálogo de herramientas del entorno aislado, y el destino devuelve la siguiente respuesta y las llamadas a herramientas. Las llamadas las ejecuta el entorno aislado de K-VeriAI (simuladas, sin efectos secundarios). Configuración → Integraciones enlaza al contrato y a un destino de ejemplo integrado.

- Consejo: para verificar el sistema de un cliente, pídale que implemente este contrato para que el organismo de verificación pueda ejecutar las evaluaciones sin recibir una clave API.

## 5. Roles y permisos

El acceso es una **matriz de capacidades**, no una jerarquía de roles. Revisores y aprobadores no pueden ejecutar las evaluaciones que firman (segregación de funciones), y los probadores no pueden aprobar sus propios resultados. La misma matriz se aplica en tres niveles.

1. Acciones del servidor: se rechaza guardar si el rol carece de la capacidad.
2. Páginas: abrir por URL una página de creación / ejecución / configuración redirige a una página «sin permiso».
3. Pantallas: los botones y formularios que el rol no puede usar se ocultan; los formularios de estado se convierten en insignias de solo lectura.

**Matriz de permisos** (● = permitido)

| Permiso | Administrador | Resp. gobernanza | Aprobador | Revisor | Probador | Lector |
|---|---|---|---|---|---|---|
| Registrar / editar sistemas de IA, registrar cambios, estado de controles | ● | ● | | | ● | |
| Eliminar sistemas de IA | ● | ● | | | | |
| Añadir riesgos, actualizar su estado | ● | ● | | | ● | |
| Crear / completar planes de evaluación | ● | ● | | | ● | |
| Iniciar / reejecutar evaluaciones | ● | ● | | | ● | |
| Anotación humana, estado de hallazgos | ● | | | ● | ● | |
| Cargar / atestar evidencias, vincular controles | ● | ● | | | ● | |
| Generar informes y paquetes, enviar a revisión | ● | ● | | | ● | |
| Marcar informes como revisados / devolver a borrador | ● | | ● | ● | | |
| Aprobar y emitir informes | ● | | ● | | | |
| Decidir aprobaciones de despliegue / aceptación de riesgos | ● | ● | ● | ● | | |
| Crear / actualizar tareas | ● | ● | ● | ● | ● | |
| Notificar / actualizar incidentes | ● | ● | ● | ● | ● | |
| Redactar documentos, solicitar revisión, actualizar o retirar | ● | ● | | | | |
| Revisar y aprobar documentos (no los propios) | ● | ● | ● | ● | | |
| Ver la configuración | ● | ● | | | | |
| Gestionar usuarios, roles, credenciales, organización | ● | | | | | |
| Ver la pista de auditoría | ● | ● | ● | ● | | |

**Diferencias de menú por rol**

| Rol | Menús ocultos | Botones retirados de las pantallas |
|---|---|---|
| Administrador | ninguno | ninguno |
| Responsable de gobernanza | ninguno | formularios de alta de usuario y credenciales en Configuración, botones de revisión/aprobación de informes, anotación humana |
| Aprobador | Configuración | botones registrar / ejecutar / añadir evidencia / generar informe, formularios de estado de riesgos y controles |
| Revisor | Configuración | botones registrar / ejecutar / añadir evidencia / generar informe, botones aprobar/emitir |
| Probador | Configuración | botones de decisión de aprobaciones, botones revisar/aprobar/emitir, formulario de políticas |
| Lector | Configuración, Aprobaciones y tareas | todos los botones y formularios de creación y modificación |

**Asignación de roles**: los administradores lo hacen en Configuración → Usuarios y roles; el cambio se aplica en la siguiente carga de página. Para cambiar la propia matriz, el equipo de desarrollo edita las listas por rol en `src/lib/permissions.ts`; una sola edición actualiza menús, botones y comprobaciones del servidor.

## 6. Funciones por rol y escenarios estándar

Una verificación fluye desde el responsable de gobernanza que registra el sistema, al probador que lo evalúa, al revisor que valida los resultados y al aprobador que emite el informe. El administrador gestiona usuarios, permisos y credenciales; el lector lee los resultados.

![Ciclo de verificación estándar por rol · 5 carriles](images/role-cycle.es.png)

Las líneas discontinuas son caminos de retorno. Cuando un revisor devuelve un informe a borrador, el probador reejecuta; el responsable de gobernanza publica los informes emitidos en el Centro de confianza.

### 6.1 Administrador

Responsable de la operación de la plataforma. En lugar de hacer el trabajo de gobernanza directamente, crea el entorno en el que los demás roles pueden trabajar.

- Añadir usuarios y asignar roles; mantener los datos de la organización y la configuración del Centro de confianza.
- Registrar, rotar y eliminar las credenciales de proveedores del modo LIVE.
- Revisar la matriz de permisos y la pista de auditoría; actuar como respaldo para cualquier función en una emergencia.
- Recurrente: revisión trimestral de usuarios y roles, rotación de claves API.

### 6.2 Responsable de gobernanza

Dirige la gobernanza de IA de la organización (CAIO, secretario de un comité de IA). En una empresa también puede hacer trabajo de probador, por lo que el rol tiene capacidades de registro y ejecución.

- Mantener el Inventario de IA: admisión de nuevos sistemas, actualizaciones del ciclo de vida, eventos de cambio.
- Establecer y activar políticas, decidir aceptaciones de riesgo, participar en las etapas de aprobación del despliegue.
- Generar paquetes de evidencias regulatorias y gestionar brechas; cargar evidencias y redactar atestaciones.
- Recurrente: revisión mensual del panel, revisión trimestral de la cobertura de los marcos, seguimiento de incidentes.

### 6.3 Probador

Realiza la evaluación y la verificación (ingenieros de pruebas de IA, red teams).

- Redactar planes de evaluación (B.1–B.5), seleccionar escenarios, ejecutar en modo DEMO o LIVE.
- Revisar resultados, clasificar hallazgos, añadir anotaciones humanas cuando sea necesario.
- Generar informes de evaluación y verificación y enviarlos a revisión (nombre del probador en el bloque de firma).
- Registrar riesgos, actualizar el estado de los controles, cargar evidencias.
- No puede: marcar sus propios informes como revisados, aprobarlos ni emitirlos, ni decidir aprobaciones de despliegue.

### 6.4 Revisor

Revisión técnica: confirma que los resultados del probador son metodológicamente sólidos.

- Revisar por muestreo los diálogos de sesión y las anotaciones del juez LLM y añadir anotaciones humanas (adjudicación NIST AI 200-3 §6).
- Decidir el estado de los hallazgos (falsos positivos, mitigaciones confirmadas).
- Marcar informes como revisados o devolverlos a borrador; decidir la etapa de revisión técnica de las aprobaciones de despliegue.
- No puede: ejecutar evaluaciones, registrar sistemas, aprobar ni emitir informes.

### 6.5 Aprobador

El firmante autorizado (responsable técnico de un organismo de verificación, directivo de una empresa).

- Aprobar y emitir los informes revisados; la emisión deja un registro de aprobación como evidencia.
- Decidir las etapas legal y de dirección de las aprobaciones y la aceptación de riesgos.
- No puede: ejecutar evaluaciones, registrar sistemas, cargar evidencias, generar informes.

### 6.6 Lector

Lee los resultados (auditoría interna, dirección, contactos de clientes). Puede ver el panel, el inventario, los riesgos, los marcos, los resultados de evaluación, las evidencias y los informes, y descargar PDF. Aprobaciones y tareas y Configuración están ocultos.

### 6.7 Escenarios estándar

**A. Aprobación de un nuevo sistema de IA**

1. Responsable de gobernanza: admisión en el Inventario de IA → nivel de riesgo y etapas de aprobación creados automáticamente.
2. Probador: redactar un plan → ejecutar la evaluación → generar el informe de verificación → enviar a revisión.
3. Revisor: validar una muestra de anotaciones → marcar el informe como revisado → aprobar la etapa de revisión técnica en Aprobaciones y tareas.
4. Aprobador: aprobar y emitir el informe → aprobar las etapas legal y de dirección.
5. Responsable de gobernanza: pasar la fase del ciclo de vida de «aprobado» a «producción».

**B. Nueva verificación tras un cambio de versión del modelo**

1. Responsable de gobernanza o probador: registrar un evento de cambio (tipo: versión del modelo) → las evidencias de prueba caducan, los controles vuelven a «en curso», se crea una tarea de reevaluación.
2. Probador: reejecutar la evaluación → generar el informe de evaluación de la nueva versión (v2).
3. Revisor y aprobador: revisión y emisión como en A.

**C. Respuesta a un incidente**

1. Cualquiera salvo los lectores: notificar el incidente → riesgo de exposición y tarea de reevaluación creados automáticamente.
2. Responsable de gobernanza: para un incidente grave, comprobar los plazos de notificación art. 73 / art. 32; registrar causa raíz y acciones correctivas.
3. Probador: volver a probar las categorías afectadas → pasar el riesgo de «en mitigación» a «cerrado».

**D. Auditoría regulatoria**

1. Responsable de gobernanza: generar el paquete de evidencias del marco → revisar la lista de brechas → cargar las evidencias que faltan o redactar atestaciones → regenerar.
2. Aprobador: emitir el paquete de evidencias.
3. Auditor (rol Lector o Revisor): leer el paquete emitido y la pista de auditoría, recibir el PDF.

## 7. Marcos regulatorios

Un control y una evidencia sirven a varios marcos a la vez. Un paquete de evidencias juzga cada requisito como cubierto / parcial / brecha y recomienda acciones para las carencias.

| Marco | Requisitos | Producto principal | Rutas clave de evidencia |
|---|---|---|---|
| ISO/IEC 42001 (sistema de gestión de IA) | 92 | Paquete de evidencias ISO/IEC 42001 | Política (5.2) → Políticas · Evaluación de riesgos (6.1) → Registro de riesgos · Evaluación de impacto (A.5) → admisión + evidencias cargadas · Evaluación del desempeño (9.1) → Ejecuciones de evaluación |
| Ley de IA de la UE | 36 | Paquete de evidencias Ley de IA de la UE, informe de verificación | Clasificación (art. 6 / anexo III) → admisión · Gestión de riesgos (art. 9) → Registro de riesgos · Documentación técnica (art. 11) → Pasaporte de IA · Exactitud y robustez (art. 15) → Ejecuciones de evaluación · Transparencia (art. 50) → escenario de divulgación · Incidentes graves (art. 73) → Incidentes |
| NIST AI RMF 1.0 | 91 | Paquete de evidencias NIST AI RMF | GOVERN → políticas y roles · MAP → admisión y riesgos · MEASURE → ejecuciones y métricas · MANAGE → aprobaciones, incidentes, cambios |
| NIST AI 200-3 (ARIA) | 5 | Informe de evaluación NIST ARIA | B.1–B.5 → Planes de evaluación · esquema de datos (SessionID, …) → sesiones de ejecución · adjudicación de anotaciones (§6) → anotación humana |
| Ley marco coreana de IA | 8 | Paquete de evidencias Ley marco KR | Determinación de IA de alto impacto → admisión · medidas de seguridad y fiabilidad → controles y ejecuciones · aviso a usuarios → escenario de transparencia · respuesta a incidentes (art. 32) → Incidentes |

**Reglas de cobertura en los paquetes de evidencias**

- CUBIERTO: todo control mapeado está verificado o implementado y hay al menos una evidencia válida vinculada.
- PARCIAL: solo algunos controles están en curso o implementados, o solo existen evidencias.
- BRECHA: controles no iniciados y sin evidencias. SIN MAPEAR significa que el requisito no tiene control; vincule las evidencias directamente al requisito.
- La puntuación de cobertura del paquete es la proporción de requisitos cubiertos: 80 % o más PASS, 50–79 % WARN, menos de 50 % FAIL.

**Notas sobre la fiabilidad de las evidencias**

- Las evidencias de ejecuciones en modo DEMO llevan una advertencia en los informes y no pueden respaldar afirmaciones reales de conformidad.
- Las anotaciones del juez LLM en modo LIVE necesitan una muestra validada por personas antes de respaldar decisiones de conformidad (indicado en la nota metodológica del informe).
- Las evidencias de prueba anteriores a un cambio del sistema caducan automáticamente; compruebe el filtro «caducadas» del Centro de evidencias antes de un envío a auditoría.

## 8. Consejos de operación y preguntas frecuentes

**Instalación y arranque** (para el equipo de desarrollo)

1. `pnpm install` → `pnpm prisma generate` → defina `DATABASE_URL` y `AUTH_SECRET` en `.env`.
2. `pnpm prisma migrate deploy` → `pnpm prisma db seed` (datos de demostración).
3. `pnpm dev` y abra http://localhost:3000. El modo LIVE necesita `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` o credenciales guardadas en Configuración.
4. La generación de PDF necesita Chromium en el servidor (`PLAYWRIGHT_BROWSERS_PATH`).

**Preguntas frecuentes**

| Pregunta | Respuesta |
|---|---|
| Falta un botón. | Su rol carece de esa capacidad. Compruebe su rol en la barra superior y pida a un administrador que lo cambie (capítulo 5). |
| Un control pasó de «verificado» a «en curso». | Se registró un evento de cambio en el sistema. Reejecute la categoría afectada y volverá a estar verificado. |
| Generé un informe en español pero los nombres de sistemas y los hallazgos están en inglés. | La estructura y el texto del informe se traducen; los valores introducidos se imprimen tal como se almacenan. Los datos de demostración están en inglés. |
| ¿Qué pasa con el informe antiguo cuando regenero? | La versión anterior de la misma combinación de sistema, tipo e idioma pasa a «sustituida» y queda enlazada. Nada se elimina. |
| ¿Puedo presentar resultados DEMO a una auditoría? | No. Los informes llevan una advertencia de modo demo. Reejecute en modo LIVE. |
| El Centro de confianza no muestra informes. | Solo aparecen los informes en estado «emitido». Un aprobador debe emitirlos. |
| Quiero añadir un requisito o un control. | Edite `docs/framework-control-library.md`, ejecute el script de construcción y vuelva a ejecutar el seed. No edite el JSON directamente. |
| No puedo obtener una clave API para el sistema externo que debo evaluar. | Pida al cliente que implemente el contrato HTTP Evaluation API y elija el adaptador «HTTP Evaluation API» (4.14). |

**Documentos relacionados** (`docs/` en el repositorio)

- `K-VeriAI-benchmark-review-and-plan.md`: revisión comparativa y plan de producto (coreano)
- `framework-control-library.md`: requisitos de los marcos y controles armonizados
- `README.md`: instalación, idioma, resumen de roles y permisos
