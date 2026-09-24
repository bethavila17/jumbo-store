# Guion de presentación y defensa (máximo 5 minutos)
**Bethania Arami Avila Dominguez – Caso 3: Enfermedad Renal Crónica (UCI 336)**

El soporte visual es el póster (`poster/poster_TP_CKD_Bethania_Avila.pdf`). Los tiempos son orientativos (total ≈ 4:45).

---

### 1. Problema (0:00 – 0:40) → bloque "Problema" del póster
> "La enfermedad renal crónica es la pérdida progresiva de la función del riñón. Afecta a cerca del 9 % de la población mundial y en sus primeras etapas no da síntomas, por eso muchas veces se diagnostica tarde. Mi objetivo fue construir un clasificador que, con análisis de rutina de sangre y orina y antecedentes como hipertensión o diabetes, identifique si un paciente tiene ERC. La clase positiva es `ckd`, porque en un tamizaje el error más grave es no detectar a un enfermo, así que la métrica que más me importa es el **Recall**."

### 2. Dataset (0:40 – 1:30) → bloque "Dataset" + gráfico de faltantes
> "Usé el dataset *Chronic Kidney Disease* del repositorio UCI, con ID 336: 400 pacientes de un hospital de la India, 250 con ERC y 150 sin ERC, y 24 variables (14 numéricas y 10 categóricas binarias). El desafío del caso son los **valores faltantes**: el 10,5 % de las celdas falta y solo 158 pacientes tienen el registro completo.
> Lo más importante que encontré en el análisis exploratorio (señalar el histograma) es que **los faltantes no son aleatorios**: un enfermo tiene en promedio 3,6 datos faltantes y un sano 0,7. Además, variables como la hemoglobina, la gravedad específica de la orina, la albúmina y la creatinina separan casi perfectamente las dos clases."

### 3. Metodología (1:30 – 2:15) → diagrama del pipeline
> "Separé 80 % para entrenamiento y 20 % para test, de forma estratificada, y el test lo usé **una sola vez al final**. Todo el preprocesamiento (codificar las categóricas a 0/1, estandarizar e imputar con la mediana) está dentro de un `Pipeline`, así en cada fold de validación cruzada se ajusta solo con los datos de entrenamiento y no hay *data leakage*. Los hiperparámetros los elegí con GridSearchCV, 5 folds estratificados, maximizando F1."

### 4. Modelos (2:15 – 2:45) → tabla de modelos
> "Comparé cuatro modelos: Regresión Logística como referencia, SVM (probé kernel lineal y RBF, C y gamma), Random Forest como ensamble (lo elegí porque es robusto a outliers y a variables correlacionadas y maneja bien la mezcla de tipos) y una red neuronal densa en Keras con Adam, entropía cruzada binaria, dropout y *early stopping*. Ajusté hiperparámetros en los cuatro."

### 5. Resultados (2:45 – 4:05) → tabla comparativa, matrices de confusión y heatmap de faltantes
> "En test, el Random Forest clasificó bien a los 80 pacientes; la SVM tuvo 1 error, la Regresión Logística 2 y la red neuronal 3. **Todos los errores son falsos negativos**: pacientes con ERC con valores casi normales, probablemente en etapa temprana. Ningún modelo dio falsos positivos.
> Como cada paciente de test vale 1,25 puntos, estas diferencias son pequeñas: en validación cruzada los cuatro modelos tienen F1 de 0,99 o más.
> Para la pregunta del caso comparé seis formas de tratar los faltantes (señalar el heatmap). **Eliminar a los pacientes incompletos es por lejos lo peor**: el F1 baja a entre 0,81 y 0,92 y el Recall hasta 0,69, porque se pierde el 60 % de los datos y los enfermos pasan de ser el 62 % a ser el 27 % de la muestra. En cambio, imputar con la mediana, con KNN o con MICE da resultados prácticamente iguales."

### 6. Conclusiones (4:05 – 4:45) → bloque "Conclusiones"
> "Concluyo tres cosas. Primero, la ERC se puede detectar con muy alta precisión con análisis de rutina, y el modelo usa variables con sentido clínico. Segundo, el Random Forest fue el más adecuado porque no dejó enfermos sin detectar, aunque la Regresión Logística es una alternativa válida y más interpretable. Tercero, y respondiendo a la pregunta del caso, **la decisión más importante no fue el modelo sino cómo tratar los faltantes**: hay que conservar a todos los pacientes e imputar dentro del pipeline. La principal limitación es que son 400 pacientes de un solo hospital, así que habría que validarlo con datos externos."

---

## Preguntas probables y respuestas

**¿Por qué 100 % de Accuracy? ¿No hay sobreajuste o leakage?**
El Test estuvo apartado desde el inicio y todo el preprocesamiento se ajusta dentro del Pipeline. La CV (F1 ≈ 0,995) y el Test coinciden, y la brecha entre train y CV es ≤ 0,005. El 100 % se explica porque las clases están casi separadas (se ve en los boxplots y en el gráfico hemoglobina vs. creatinina) y porque el Test tiene solo 80 pacientes. La literatura reporta lo mismo: Qin et al. (IEEE Access 2020) obtuvieron 99,75 %.

**¿Por qué imputar con la mediana y no con la media?**
Porque `sc`, `bu` y `bgr` tienen outliers muy grandes (creatinina de hasta 76 mg/dl) que desplazarían la media. En variables binarias codificadas 0/1, la mediana coincide con la moda.

**¿Cómo evitaste el data leakage en la imputación?**
El imputador está dentro del `Pipeline`: en cada fold calcula la mediana solo con los datos de entrenamiento de ese fold y sobre Test solo aplica `transform`. Lo mismo ocurre con el escalado y con la elección de columnas en la estrategia E2.

**¿Por qué no usar la estrategia con indicadores de faltante si dio F1 = 1,00?**
Porque un modelo que solo sabe *qué datos faltan* ya predice con AUC ≈ 0,86: la ausencia de datos refleja cómo se registró la información en ese hospital. Es una señal que probablemente no se repita en otro centro. La mediana da prácticamente lo mismo y es más prudente.

**¿Qué significa "no MCAR"?**
MCAR (*Missing Completely At Random*) significa que la probabilidad de que falte un dato no depende de nada. Acá depende de la clase (a los enfermos les faltan más datos), así que eliminar filas sesga la muestra.

**¿Por qué el Random Forest y no Gradient Boosting?**
El RF reduce la varianza promediando árboles, algo importante con pocos datos; tiene pocos hiperparámetros sensibles y es robusto a outliers y a colinealidad. Gradient Boosting (o XGBoost, que maneja faltantes de forma nativa) queda como trabajo futuro.

**¿Qué hace el parámetro C en la SVM? ¿Y gamma?**
C controla el compromiso entre un margen amplio y clasificar bien todos los puntos de entrenamiento: con C alto se penalizan más los errores y la frontera es más ajustada. Gamma define el alcance de cada vector soporte en el kernel RBF: con gamma alto la frontera es más compleja y hay más riesgo de sobreajuste.

**¿Por qué la red neuronal tuvo más errores si su AUC es alta?**
El AUC mide si ordena bien a los pacientes, independientemente del umbral. La red ordena bien, pero con el umbral de 0,5 algunos enfermos límite quedan con probabilidad menor a 0,5. Se podría bajar el umbral o calibrar las probabilidades. Además, con ~256 pacientes una red no tiene ventaja sobre los modelos clásicos.

**¿Qué es el early stopping y por qué lo usaste?**
Se separa un 20 % del conjunto de entrenamiento como validación interna, y el entrenamiento se detiene cuando la pérdida de validación deja de mejorar durante 20 épocas; luego se restauran los mejores pesos. Evita el sobreajuste sin fijar el número de épocas a mano, y nunca usa el Test.

**¿Por qué F1 como métrica de selección y no Accuracy?**
Porque las clases están desbalanceadas (62,5/37,5) y porque interesa equilibrar Precision y Recall de la clase ERC. Con Accuracy, un modelo que dijera siempre "ckd" ya tendría 62,5 %.

**¿Por qué tratar sg, al y su como numéricas si en el ARFF son nominales?**
Tienen orden natural (la albúmina 0–5 es una escala semicuantitativa). Tratarlas como ordinales conserva ese orden; el one-hot lo perdería y además agregaría columnas.

**¿Cuáles son las limitaciones?**
Son 400 pacientes de un solo hospital; los faltantes están asociados a la clase; no hay eGFR ni estadio de ERC; y el Test es chico (cada error vale 1,25 puntos).

**¿Qué harías con más tiempo?**
Validación externa, validación cruzada anidada, ajuste del umbral para priorizar el Recall, probar XGBoost, selección de variables de bajo costo y explicaciones con SHAP.
