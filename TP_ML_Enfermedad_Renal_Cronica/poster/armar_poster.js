// Genera el póster en PowerPoint (A1 vertical, 3 columnas) a partir de las figuras del notebook.
// Uso:  node armar_poster.js   (requiere: npm install pptxgenjs)
const pptxgen = require("pptxgenjs");
const path = require("path");

const FIG = (n) => path.join(__dirname, "..", "figuras", n);
const pres = new pptxgen();
pres.defineLayout({ name: "A1", width: 23.39, height: 33.11 });
pres.layout = "A1";
pres.author = "Bethania Arami Avila Dominguez";
pres.title = "Detección de Enfermedad Renal Crónica con Machine Learning";

const NAVY = "1F3A5F", INK = "222222", MUTED = "555555", BOX = "F2F4F7", WHITE = "FFFFFF";
const ROJO = "B03A2E", AZUL = "2C6FAA", VERDE_BG = "E3F1E7";
const BODY = 21, CAP = 17, H2 = 32;
const FONT = "Calibri";

const s = pres.addSlide();
s.background = { color: WHITE };

// ---------- encabezado ----------
s.addImage({ path: path.join(__dirname, "logo_ucom.png"), x: 0.7, y: 0.7, w: 2.6, h: 2.6 });
s.addText("Universidad Comunera (UCOM)  ·  Taller de Machine Learning – Proyecto II ML  ·  Trabajo Práctico Integrador", {
  x: 3.7, y: 0.65, w: 19, h: 0.6, fontFace: FONT, fontSize: 20, color: MUTED, isTextBox: true, margin: 0 });
s.addText("Detección de enfermedad renal crónica con Machine Learning y efecto del tratamiento de los valores faltantes", {
  x: 3.7, y: 1.2, w: 19, h: 1.95, fontFace: FONT, fontSize: 38, bold: true, color: NAVY, isTextBox: true, margin: 0, valign: "top" });
s.addText([
  { text: "Bethania Arami Avila Dominguez", options: { bold: true, fontSize: 26, color: INK } },
  { text: "     Caso 3 · Dataset Chronic Kidney Disease (UCI ID 336) · Septiembre 2026", options: { fontSize: 22, color: MUTED } },
], { x: 3.7, y: 3.25, w: 19, h: 0.55, fontFace: FONT, isTextBox: true, margin: 0 });

// ---------- utilidades ----------
const M = 0.6, GAP = 0.4, COLW = (23.39 - 2 * M - 2 * GAP) / 3;   // 7.13
const X = [M, M + COLW + GAP, M + 2 * (COLW + GAP)];
const PAD = 0.3;

function caja(col, y, h, titulo) {
  s.addShape(pres.ShapeType.rect, { x: X[col], y, w: COLW, h, fill: { color: BOX }, line: { color: BOX } });
  s.addText(titulo, { x: X[col] + PAD, y: y + 0.18, w: COLW - 2 * PAD, h: 0.6, fontFace: FONT, fontSize: H2, bold: true,
    color: NAVY, isTextBox: true, margin: 0 });
  return { x: X[col] + PAD, y: y + 0.95, w: COLW - 2 * PAD };
}
function parrafos(c, y, h, items, opts = {}) {
  const runs = items.map((t, i) => {
    const r = typeof t === "string" ? { text: t, options: {} } : t;
    r.options = { ...r.options, breakLine: i < items.length - 1, ...(opts.bullet ? { bullet: true, indentLevel: 0 } : {}) };
    return r;
  });
  s.addText(runs, { x: c.x, y, w: c.w, h, fontFace: FONT, fontSize: opts.size || BODY, color: INK, isTextBox: true, margin: 0,
    valign: "top", paraSpaceAfter: opts.space ?? 8, ...(opts.extra || {}) });
}
function figura(c, y, archivo, ancho, alto, cap, capH = 0.7) {
  const x = c.x + (c.w - ancho) / 2;
  s.addImage({ path: archivo, x, y, w: ancho, h: alto });
  if (cap) s.addText(cap, { x: c.x, y: y + alto + 0.05, w: c.w, h: capH, fontFace: FONT, fontSize: CAP, color: MUTED,
    isTextBox: true, margin: 0, valign: "top" });
  return y + alto + (cap ? capH + 0.05 : 0);
}
const b = (text) => ({ text, options: { bold: true, breakLine: true } });

// ================= COLUMNA 1 =================
let c = caja(0, 4.3, 6.6, "1. Problema");
parrafos(c, c.y, 5.5, [
  "La enfermedad renal crónica (ERC) afecta a cerca del 9 % de la población mundial y en sus primeras etapas no da síntomas, por eso se diagnostica tarde [2], [3].",
  "Objetivo: clasificar pacientes con ERC (ckd = 1) y sin ERC (notckd = 0) usando análisis de rutina de sangre y orina y antecedentes clínicos.",
  "En un tamizaje el error más grave es el falso negativo (un enfermo que pasa como sano), así que la métrica que más importa es el Recall.",
  "Pregunta del caso: ¿cómo afecta el tratamiento de los valores faltantes al desempeño final de los modelos?",
]);

c = caja(0, 11.3, 8.7, "2. Dataset");
parrafos(c, c.y, 1.3, ["Chronic Kidney Disease, UCI Machine Learning Repository, ID 336 [1]. Pacientes del Apollo Hospitals (Tamil Nadu, India)."]);
// fila de cifras
const stats = [["400", "pacientes"], ["250 / 150", "ckd / notckd (62,5 % / 37,5 %)"], ["24", "variables: 14 numéricas + 10 binarias"],
  ["10,5 %", "de celdas faltantes"], ["158", "pacientes con registro completo (40 %)"], ["80 / 20", "partición Training / Test"]];
const sw = (c.w - 0.2) / 3, sy = c.y + 1.35;
stats.forEach((st, i) => {
  const x = c.x + (i % 3) * (sw + 0.1), y = sy + Math.floor(i / 3) * 1.35;
  s.addShape(pres.ShapeType.rect, { x, y, w: sw, h: 1.25, fill: { color: WHITE }, line: { color: "D5DAE3", width: 0.75 } });
  s.addText(st[0], { x, y: y + 0.08, w: sw, h: 0.6, fontFace: FONT, fontSize: 26, bold: true, color: i === 1 ? ROJO : NAVY, align: "center", isTextBox: true, margin: 0 });
  s.addText(st[1], { x: x + 0.05, y: y + 0.68, w: sw - 0.1, h: 0.5, fontFace: FONT, fontSize: 14, color: MUTED, align: "center", isTextBox: true, margin: 0, valign: "top" });
});
let y = figura(c, sy + 2.85, FIG("02_faltantes.png"), 6.5, 6.5 * 695 / 2229,
  "Faltantes por variable y por paciente según la clase. No son aleatorios: a un paciente con ERC le faltan en promedio 3,6 datos y a uno sano 0,7. Entre los registros completos solo el 27 % es ckd.", 1.4);

c = caja(0, 20.4, 12.1, "3. Análisis exploratorio");
y = figura(c, c.y, FIG("07_dispersion_hemo_sc.png"), 4.8, 4.8 * 450 / 600, "Con solo dos variables las clases ya quedan casi separadas.", 0.5);
parrafos(c, y + 0.15, 3.8, [
  "En ERC bajan la hemoglobina, el hematocrito y la gravedad específica de la orina, y suben la creatinina, la urea y la albúmina.",
  "Hipertensión, diabetes, anemia y edema aparecen solo en pacientes con ERC.",
  "Hay valores extremos reales (creatinina de hasta 76 mg/dl); se conservan.",
], { bullet: true });
figura(c, y + 0.15 + 3.9, FIG("05_categoricas.png"), 6.0, 6.0 * 400 / 1000, "Variables categóricas por clase: los signos clínicos aparecen solo en pacientes con ERC.", 0.6);

// ================= COLUMNA 2 =================
c = caja(1, 4.3, 8.9, "4. Metodología");
parrafos(c, c.y, 2.9, [
  "Partición 80 / 20 estratificada. El Test (80 pacientes) se aparta al inicio y se usa una sola vez, al final.",
  "Todo el preprocesamiento (codificación 0/1, estandarización e imputación por mediana) va dentro de un Pipeline de scikit-learn, así en cada fold se ajusta solo con datos de entrenamiento y no hay data leakage.",
  "Hiperparámetros con GridSearchCV, validación cruzada estratificada de 5 folds sobre Training, métrica F1. Semilla fija (42).",
]);
s.addTable([
  [{ text: "Modelo", options: { bold: true, color: WHITE, fill: { color: NAVY } } }, { text: "Hiperparámetros explorados", options: { bold: true, color: WHITE, fill: { color: NAVY } } }, { text: "Mejor configuración", options: { bold: true, color: WHITE, fill: { color: NAVY } } }],
  ["Regresión Logística", "C ∈ {0,01 … 100}; L1 / L2; class_weight", "C = 10, L2"],
  ["SVM", "kernel lineal / RBF; C ∈ {0,1 … 100}; gamma", "RBF, C = 10, gamma = scale"],
  ["Random Forest", "n árboles; profundidad; hojas; max_features", "200 árboles, sin límite de profundidad"],
  ["Red neuronal (Keras)", "capas (8) · (16, 8) · (32, 16); dropout 0 / 0,3", "24 → 8 → 1, dropout 0,3"],
], { x: c.x, y: c.y + 3.0, w: c.w, colW: [1.9, 2.75, 1.88], fontFace: FONT, fontSize: 15, color: INK, fill: { color: WHITE },
  border: { type: "solid", color: "D5DAE3", pt: 0.75 }, margin: 0.06, rowH: 0.55, valign: "middle" });
s.addText("Red: ReLU + salida sigmoide, entropía cruzada binaria, Adam (lr 0,003), batch 32, early stopping con paciencia 20.",
  { x: c.x, y: c.y + 6.4, w: c.w, h: 1.0, fontFace: FONT, fontSize: CAP, color: MUTED, isTextBox: true, margin: 0, valign: "top" });

c = caja(1, 13.5, 19.0, "5. Resultados en Test");
const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, align: "center" } });
const fila = (m, vals, best) => [{ text: m, options: { bold: !!best, fill: { color: best ? VERDE_BG : WHITE } } },
  ...vals.map((v) => ({ text: v, options: { align: "center", bold: !!best, fill: { color: best ? VERDE_BG : WHITE } } }))];
s.addTable([
  [hdr("Modelo"), hdr("Acc."), hdr("Prec."), hdr("Rec."), hdr("F1"), hdr("AUC"), hdr("F1 CV")],
  fila("Regresión Logística", ["0,975", "1,000", "0,960", "0,980", "0,999", "0,997"]),
  fila("SVM (RBF)", ["0,988", "1,000", "0,980", "0,990", "1,000", "0,997"]),
  fila("Random Forest", ["1,000", "1,000", "1,000", "1,000", "1,000", "0,995"], true),
  fila("Red neuronal", ["0,963", "1,000", "0,940", "0,969", "0,995", "0,995"]),
], { x: c.x, y: c.y, w: c.w, colW: [1.78, 0.79, 0.79, 0.79, 0.79, 0.79, 0.8], fontFace: FONT, fontSize: 14, color: INK,
  border: { type: "solid", color: "D5DAE3", pt: 0.75 }, margin: 0.03, rowH: 0.48, valign: "middle" });
y = c.y + 2.9;
y = figura(c, y, FIG("09_matrices_confusion.png"), 6.5, 6.5 * 400 / 1700,
  "Matrices de confusión. Ningún modelo dio falsos positivos; todos los errores son enfermos no detectados (FN: 2 · 1 · 0 · 3), o sea diferencias de 1 a 3 pacientes.", 1.25);
// ROC a la izquierda con texto a la derecha
s.addImage({ path: FIG("10_curvas_roc.png"), x: c.x, y: y + 0.1, w: 3.2, h: 3.2 * 500 / 600 });
s.addText("Curvas ROC: AUC ≥ 0,995 en los cuatro modelos. Todos ordenan bien a los pacientes; las diferencias aparecen al aplicar el umbral de 0,5. Brecha train–CV ≤ 0,005: no hay sobreajuste.",
  { x: c.x + 3.4, y: y + 0.15, w: c.w - 3.4, h: 2.7, fontFace: FONT, fontSize: 18, color: INK, isTextBox: true, margin: 0, valign: "top" });
y = y + 0.1 + 3.2 * 500 / 600 + 0.2;
y = figura(c, y, FIG("12_importancia_variables.png"), 6.5, 6.5 * 500 / 1300,
  "Variables más importantes según la Regresión Logística (coeficientes) y el Random Forest (permutación): hemoglobina, gravedad específica, hematocrito, albúmina, creatinina, hipertensión y diabetes.", 1.5);
parrafos(c, y + 0.05, 3.4, [
  "Los tres pacientes mal clasificados tienen valores casi normales (hemoglobina 13,9–16,1 g/dl, sin hipertensión ni diabetes): probablemente ERC en etapa temprana.",
  "La red neuronal falló además en un paciente con creatinina 32 y urea 391: fuera del rango de entrenamiento extrapola mal; el Random Forest no tiene ese problema.",
], { bullet: true, size: 19, space: 6 });

// ================= COLUMNA 3 =================
c = caja(2, 4.3, 11.9, "6. Valores faltantes");
parrafos(c, c.y, 1.7, ["Se compararon 6 estrategias con los mismos hiperparámetros (validación cruzada 5×2 sobre Training, evaluando siempre sobre todos los pacientes)."]);
y = figura(c, c.y + 1.75, FIG("../poster/poster_heatmap_faltantes.png"), 6.5, 6.5 * 695 / 1150, "F1 medio según estrategia de faltantes y modelo.", 0.45);
s.addShape(pres.ShapeType.rect, { x: c.x, y: y + 0.1, w: c.w, h: 4.7, fill: { color: WHITE }, line: { color: "D5DAE3", width: 0.75 } });
parrafos({ x: c.x + 0.2, y: 0, w: c.w - 0.4 }, y + 0.25, 4.4, [
  b("Eliminar los pacientes incompletos: F1 0,81–0,92 y Recall 0,69–0,86."),
  "Se pierde el 62 % del entrenamiento y la proporción de ckd cae de 62,5 % a 26,5 %, porque los faltantes se concentran en los enfermos. Los modelos dejan de detectar enfermos.",
  b("Cualquier imputación (mediana, KNN, MICE): F1 ≥ 0,98."),
  "Un modelo que solo sabe qué datos faltan ya logra AUC 0,86: la ausencia de datos es informativa, pero depende del protocolo de registro del hospital.",
], { size: 19, space: 6 });

c = caja(2, 16.6, 8.3, "7. Conclusiones");
parrafos(c, c.y, 7.2, [
  "La ERC se detecta con muy alta precisión a partir de análisis de rutina, y los modelos se apoyan en variables con sentido clínico.",
  "El Random Forest fue el más adecuado: Recall = 1,00, ningún enfermo sin detectar. La Regresión Logística es una alternativa válida y más fácil de interpretar.",
  "La decisión con más impacto no fue el modelo sino el tratamiento de los faltantes: hay que conservar a todos los pacientes e imputar dentro del pipeline. El método de imputación es secundario.",
  "Limitaciones: 400 pacientes de un solo hospital, faltantes asociados a la clase y Test chico (cada error vale 1,25 puntos).",
  "Trabajo futuro: validación externa, ajuste del umbral para priorizar el Recall, XGBoost, explicaciones con SHAP.",
], { bullet: true });

c = caja(2, 25.3, 7.2, "Referencias");
parrafos(c, c.y - 0.15, 6.3, [
  "[1] L. J. Rubini, P. Soundarapandian y P. Eswaran, “Chronic Kidney Disease,” UCI Machine Learning Repository, 2015. doi: 10.24432/C5G020.",
  "[2] KDIGO CKD Work Group, “KDIGO 2012 clinical practice guideline for the evaluation and management of chronic kidney disease,” Kidney Int. Suppl., vol. 3, no. 1, pp. 1–150, 2013.",
  "[3] GBD Chronic Kidney Disease Collaboration, “Global, regional, and national burden of chronic kidney disease, 1990–2017,” The Lancet, vol. 395, pp. 709–733, 2020.",
  "[4] J. Qin et al., “A machine learning methodology for diagnosing chronic kidney disease,” IEEE Access, vol. 8, pp. 20991–21002, 2020.",
  "[5] H. Polat, H. Danaei Mehr y A. Cetin, “Diagnosis of chronic kidney disease based on support vector machine by feature selection methods,” J. Med. Syst., vol. 41, no. 4, 2017.",
  "[7] L. Breiman, “Random forests,” Machine Learning, vol. 45, no. 1, pp. 5–32, 2001.   [11] D. B. Rubin, “Inference and missing data,” Biometrika, vol. 63, no. 3, pp. 581–592, 1976.",
], { size: 13, space: 3 });

s.addText("Notebook completo (Google Colab), datos y figuras: repositorio del trabajo. Numeración de referencias según el notebook.",
  { x: M, y: 32.55, w: 23.39 - 2 * M, h: 0.4, fontFace: FONT, fontSize: 13, color: MUTED, isTextBox: true, margin: 0 });

pres.writeFile({ fileName: path.join(__dirname, "poster_TP_CKD_Bethania_Avila.pptx") }).then((f) => console.log("Escrito", f));
