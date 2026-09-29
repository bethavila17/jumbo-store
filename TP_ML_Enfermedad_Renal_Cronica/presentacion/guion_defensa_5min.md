# Guion para la presentación y defensa (5 minutos)
**Bethania Arami Avila Dominguez – Caso 3: Enfermedad Renal Crónica (UCI 336)**

El apoyo visual es el póster (`poster/poster_TP_CKD_Bethania_Avila.pdf`). Los tiempos son aproximados, en total son unos 4 minutos y medio para dejar margen.

---

### 1. Problema (0:00 – 0:40)
La enfermedad renal crónica es la pérdida progresiva de la función del riñón. Afecta a cerca del 9 % de la población y en las primeras etapas no da síntomas, por eso muchas veces se diagnostica tarde. Lo que hice fue un clasificador que, con análisis de rutina de sangre y orina y antecedentes como hipertensión o diabetes, diga si un paciente tiene ERC o no. La clase positiva es `ckd`, porque en un tamizaje el error más grave es no detectar a un enfermo, así que la métrica que más me importa es el Recall.

### 2. Dataset (0:40 – 1:30)
Usé el dataset Chronic Kidney Disease del repositorio UCI, ID 336. Son 400 pacientes de un hospital de la India, 250 con ERC y 150 sin, y 24 variables, 14 numéricas y 10 categóricas. El desafío del caso son los valores faltantes: falta el 10,5 % de las celdas y solo 158 pacientes tienen el registro completo.

Lo más importante que vi en el análisis exploratorio (señalar el gráfico de faltantes) es que los faltantes no son aleatorios: a un enfermo le faltan en promedio 3,6 datos y a un sano 0,7. Aparte, variables como la hemoglobina, la gravedad específica de la orina, la albúmina y la creatinina separan casi perfecto las dos clases.

### 3. Metodología (1:30 – 2:15)
Separé 80 % para entrenamiento y 20 % para test, estratificado, y el test lo usé una sola vez al final. Todo el preprocesamiento (pasar las categóricas a 0/1, estandarizar e imputar con la mediana) está dentro de un Pipeline, así en cada fold de la validación cruzada se ajusta solo con los datos de entrenamiento y no hay data leakage. Los hiperparámetros los elegí con GridSearchCV, 5 folds estratificados, maximizando F1.

### 4. Modelos (2:15 – 2:45)
Comparé cuatro modelos: Regresión Logística como referencia, SVM (probé kernel lineal y RBF, C y gamma), Random Forest como ensamble (lo elegí porque aguanta outliers y variables correlacionadas y maneja bien la mezcla de tipos) y una red neuronal densa en Keras con Adam, entropía cruzada binaria, dropout y early stopping. A los cuatro les ajusté hiperparámetros.

### 5. Resultados (2:45 – 4:05)
En test, el Random Forest clasificó bien a los 80 pacientes; la SVM tuvo 1 error, la Regresión Logística 2 y la red neuronal 3. Todos los errores son falsos negativos, pacientes con ERC con valores casi normales, seguramente en etapa temprana. Ningún modelo dio falsos positivos. Como cada paciente de test vale 1,25 puntos, las diferencias son chicas: en validación cruzada los cuatro tienen F1 de 0,99 o más.

Para la pregunta del caso comparé seis formas de tratar los faltantes (señalar el mapa de calor). Eliminar a los pacientes incompletos es lejos lo peor: el F1 baja a entre 0,81 y 0,92 y el Recall hasta 0,69, porque se pierde el 60 % de los datos y los enfermos pasan de ser el 62 % a ser el 27 % de la muestra. En cambio, imputar con la mediana, con KNN o con MICE da prácticamente lo mismo.

### 6. Conclusiones (4:05 – 4:45)
Me quedo con tres cosas. La ERC se puede detectar con mucha precisión con análisis de rutina, y el modelo se apoya en variables que tienen sentido clínico. El Random Forest fue el más adecuado porque no dejó enfermos sin detectar, aunque la Regresión Logística es una alternativa válida y más fácil de interpretar. Y respondiendo a la pregunta del caso, la decisión más importante no fue el modelo sino cómo tratar los faltantes: hay que conservar a todos los pacientes e imputar dentro del pipeline. La limitación principal es que son 400 pacientes de un solo hospital, habría que validarlo con datos de otro lado.

---

## Preguntas que pueden hacer y cómo responder

**¿Por qué 100 % de Accuracy? ¿No hay sobreajuste o leakage?**
El Test estuvo apartado desde el inicio y todo el preprocesamiento se ajusta dentro del Pipeline. La CV (F1 ≈ 0,995) y el Test coinciden, y la brecha entre train y CV es de 0,005 o menos. El 100 % se explica porque las clases están casi separadas (se ve en los boxplots y en el gráfico de hemoglobina contra creatinina) y porque el Test tiene solo 80 pacientes. La literatura reporta lo mismo: Qin et al. (IEEE Access 2020) llegaron a 99,75 %.

**¿Por qué imputar con la mediana y no con la media?**
Porque `sc`, `bu` y `bgr` tienen outliers muy grandes (creatinina de hasta 76 mg/dl) que corren la media. En las variables binarias codificadas 0/1 la mediana es igual a la moda.

**¿Cómo evitaste el data leakage en la imputación?**
El imputador está dentro del Pipeline: en cada fold calcula la mediana solo con los datos de entrenamiento de ese fold y sobre Test solo aplica `transform`. Lo mismo pasa con el escalado y con la elección de columnas en la estrategia E2.

**¿Por qué no usaste la estrategia con indicadores de faltante si dio F1 = 1,00?**
Porque un modelo que solo sabe qué datos faltan ya predice con AUC 0,86: la ausencia de datos refleja cómo se cargó la información en ese hospital. Es una señal que seguramente no se repite en otro centro. La mediana da prácticamente lo mismo y es más prudente.

**¿Qué quiere decir que los datos no son MCAR?**
MCAR (Missing Completely At Random) es cuando la probabilidad de que falte un dato no depende de nada. Acá depende de la clase (a los enfermos les faltan más datos), por eso eliminar filas sesga la muestra.

**¿Por qué Random Forest y no Gradient Boosting?**
El RF baja la varianza promediando árboles, que es importante con pocos datos; tiene pocos hiperparámetros sensibles y aguanta outliers y colinealidad. Gradient Boosting (o XGBoost, que maneja faltantes de forma nativa) queda como trabajo futuro.

**¿Qué hace el parámetro C en la SVM? ¿Y gamma?**
C controla el compromiso entre un margen amplio y clasificar bien todos los puntos de entrenamiento: con C alto se penalizan más los errores y la frontera queda más ajustada. Gamma define el alcance de cada vector soporte en el kernel RBF: con gamma alto la frontera es más compleja y hay más riesgo de sobreajuste.

**¿Por qué la red neuronal tuvo más errores si su AUC es alta?**
El AUC mide si ordena bien a los pacientes, sin importar el umbral. La red ordena bien, pero con el umbral de 0,5 algunos enfermos límite quedan con probabilidad menor a 0,5. Se podría bajar el umbral o calibrar las probabilidades. Aparte, con unos 256 pacientes una red no tiene ventaja sobre los modelos clásicos. También vi que un paciente con creatinina 32 y urea 391 (valores extremos) la red lo mandó a P(ckd) ≈ 0: fuera del rango que vio en entrenamiento extrapola mal, cosa que al Random Forest no le pasa.

**¿Qué es el early stopping y por qué lo usaste?**
Se separa un 20 % del conjunto de entrenamiento como validación interna, y el entrenamiento se corta cuando la pérdida de validación deja de mejorar durante 20 épocas; después se restauran los mejores pesos. Evita el sobreajuste sin fijar el número de épocas a mano, y nunca usa el Test.

**¿Por qué F1 como métrica de selección y no Accuracy?**
Porque las clases están desbalanceadas (62,5/37,5) y porque me interesa equilibrar Precision y Recall de la clase ERC. Con Accuracy, un modelo que diga siempre "ckd" ya tendría 62,5 %.

**¿Por qué tratar sg, al y su como numéricas si en el ARFF son nominales?**
Tienen orden natural (la albúmina 0–5 es una escala semicuantitativa). Tratarlas como ordinales conserva ese orden; el one-hot lo perdería y encima agregaría columnas.

**¿Cuáles son las limitaciones?**
Son 400 pacientes de un solo hospital; los faltantes están asociados a la clase; no hay eGFR ni estadio de ERC; y el Test es chico (cada error vale 1,25 puntos).

**¿Qué harías con más tiempo?**
Validación externa, validación cruzada anidada, ajustar el umbral para priorizar el Recall, probar XGBoost, selección de variables de bajo costo y explicaciones con SHAP.
