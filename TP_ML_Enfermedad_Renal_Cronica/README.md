# TP Integrador – Machine Learning Aplicado a Datos Reales
## Caso 3 – Enfermedad Renal Crónica (UCI ID 336)

**Estudiante:** Bethania Arami Avila Dominguez

Clasificación binaria de pacientes con y sin enfermedad renal crónica (`ckd` / `notckd`) con cuatro modelos:
Regresión Logística, SVM, Random Forest y una red neuronal en Keras. La pregunta particular del caso es
**cómo afecta el tratamiento de los valores faltantes al desempeño final**.

### Contenido

| Archivo | Entregable |
|---|---|
| `TP_ML_Enfermedad_Renal_Cronica_Bethania_Avila.ipynb` | **Google Colab: informe técnico completo** (secciones 5 a 14 de la consigna). Se incluye ya ejecutado, con todas las salidas. |
| `poster/poster_TP_CKD_Bethania_Avila.pdf` | **Póster científico** (A1 vertical, listo para imprimir o proyectar). |
| `poster/poster_TP_CKD_Bethania_Avila.html` | Fuente editable del póster (se abre en el navegador; las figuras están en `figuras/`). |
| `presentacion/guion_defensa_5min.md` | **Guion de la presentación oral** (5 min) y preguntas probables con sus respuestas. |
| `data/chronic_kidney_disease_full.arff` | Dataset original descargado de UCI (respaldo si `ucimlrepo` no está disponible). |
| `figuras/` | Figuras y tabla comparativa generadas por el notebook (se regeneran al ejecutarlo). |
| `requirements.txt` | Dependencias para ejecutarlo fuera de Colab. |

### Cómo ejecutar

**En Google Colab (lo recomendado por la consigna)**
1. Abrir <https://colab.research.google.com> → *Archivo → Subir notebook* → elegir el `.ipynb`.
   Si el repositorio es público, también se puede abrir directo:
   <https://colab.research.google.com/github/bethavila17/jumbo-store/blob/claude/confident-newton-3g2hoe/TP_ML_Enfermedad_Renal_Cronica/TP_ML_Enfermedad_Renal_Cronica_Bethania_Avila.ipynb>
2. *Entorno de ejecución → Ejecutar todas*. Tarda entre 12 y 16 minutos en CPU (la mayor parte es la red neuronal).
3. Los datos se descargan de UCI con `ucimlrepo` (`fetch_ucirepo(id=336)`). Si UCI no respondiera, subir
   `data/chronic_kidney_disease_full.arff` al panel *Archivos* de Colab (en una carpeta `data/` o en la raíz)
   y volver a ejecutar: el notebook lo detecta solo.

**En local**
```bash
cd TP_ML_Enfermedad_Renal_Cronica
python -m venv .venv && source .venv/bin/activate      # opcional
pip install -r requirements.txt
jupyter notebook TP_ML_Enfermedad_Renal_Cronica_Bethania_Avila.ipynb
# o, sin abrir la interfaz:
jupyter nbconvert --to notebook --execute --inplace TP_ML_Enfermedad_Renal_Cronica_Bethania_Avila.ipynb
```

### Reproducibilidad
- Semilla global `SEED = 42` (partición, CV, Random Forest, TensorFlow).
- Partición 80/20 estratificada; Test se usa una sola vez, al final.
- Todo el preprocesamiento (codificación, escalado, imputación) está dentro de `Pipeline`, por lo que se ajusta
  únicamente con datos de entrenamiento en cada fold (sin *data leakage*).
- La red neuronal puede variar en ±1 paciente entre máquinas distintas (CPU/GPU, versión de TensorFlow).
  Los modelos de scikit-learn dan resultados idénticos.

### Regenerar el póster
El póster usa las figuras de `figuras/`. Después de ejecutar el notebook:
```bash
cd poster
python recortar_heatmap.py        # recorta el heatmap de faltantes para el póster
chromium --headless --no-sandbox --print-to-pdf=poster_TP_CKD_Bethania_Avila.pdf \
         --no-pdf-header-footer poster_TP_CKD_Bethania_Avila.html
```
(También puede abrirse el `.html` en Chrome y usar *Imprimir → Guardar como PDF*, con tamaño A1 y sin márgenes).
