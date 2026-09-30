# Guía de estudio para la defensa
**Bethania Arami Avila Dominguez – Caso 3: Enfermedad Renal Crónica**

La idea de esta guía es que entiendas el trabajo entero, no que lo memorices. Está en tres partes:
1. La historia del trabajo, paso por paso, con el "por qué" de cada cosa.
2. Qué significan todas las siglas.
3. Preguntas que puede hacer el profesor, con respuestas cortas para decir en voz alta.

---

## Parte 1. La historia del trabajo y por qué se hace cada paso

Pensalo como si fueras una doctora que quiere una ayuda para detectar enfermos de los riñones.

**1. El problema.**
La enfermedad renal crónica (ERC) no da síntomas al principio, así que muchos se enteran tarde. Queremos un programa que, mirando análisis de rutina, diga "este paciente probablemente tiene ERC" o "probablemente no". A eso se le llama clasificación: el programa elige entre dos opciones (`ckd` o `notckd`).

**2. Los datos.**
Tenemos 400 pacientes reales. De cada uno se sabe la edad, la presión, resultados de análisis de sangre y orina, si tiene diabetes o hipertensión, y lo más importante: si tiene ERC o no (eso lo decidió un médico). Con eso el programa "aprende" qué combinación de análisis suele tener un enfermo.

**3. Mirar los datos antes de tocarlos (análisis exploratorio).**
Antes de entrenar nada hay que mirar: cuántos enfermos y cuántos sanos hay, qué datos faltan, cómo se ven los valores de los enfermos frente a los de los sanos. Se hace para no entrenar a ciegas. Acá descubrimos dos cosas importantes: los enfermos y los sanos se distinguen muy fácil (por ejemplo, la hemoglobina baja en los enfermos) y hay muchos datos faltantes.

**4. Preparar los datos (preprocesamiento).**
Los modelos no pueden trabajar con huecos ni con palabras. Hay que:
- Pasar las palabras a números (`normal` = 0, `abnormal` = 1).
- Rellenar los huecos (imputar). Nosotros usamos la mediana: el valor del medio de esa columna.
- Poner todas las variables en la misma escala (estandarizar). Si no, una variable en miles (glóbulos blancos, 8000) le "gana" a una en decenas (hemoglobina, 12) solo por tener números más grandes, no porque importe más.

**5. Separar en Train y Test (80 % y 20 %).**
Esto es lo más importante de todo el trabajo. Es como estudiar para un examen: el Train son los ejercicios con los que practicás y el Test es el examen final con preguntas que nunca viste. Si probaras al modelo con los mismos datos con los que aprendió, sacaría 10 pero no sabrías si aprendió o si se acordó de memoria. El Test se guarda cerrado y se abre una sola vez, al final.

**6. El Pipeline y el "data leakage".**
Data leakage (fuga de datos) es cuando, sin querer, el modelo "espía" información del Test. Un ejemplo: si calculo la mediana para rellenar huecos usando los 400 pacientes, la mediana ya incluye información de los pacientes del Test. Para evitarlo, el Pipeline hace todo (rellenar, estandarizar, entrenar) usando solo los pacientes de Train, y después aplica lo aprendido al Test.

**7. Probar cuatro modelos distintos.**
Un modelo es una "forma de aprender". Usamos cuatro para comparar:
- Regresión Logística: la más simple. Dibuja una línea que separa enfermos de sanos y da una probabilidad. Es la referencia.
- SVM: también busca la mejor línea de separación, pero la que deja más "margen" (más espacio) a cada lado. Con el kernel RBF puede hacer líneas curvas.
- Random Forest: muchos árboles de decisión (preguntas tipo "¿hemoglobina menor a 12? ¿albúmina mayor a 1?") que votan entre todos. Es el ensamble.
- Red neuronal: capas de "neuronas" matemáticas conectadas entre sí. Es la más flexible pero necesita más datos.

**8. Ajustar hiperparámetros (GridSearchCV).**
Cada modelo tiene "perillas" (por ejemplo, cuánto penalizar los errores en la SVM). Se llaman hiperparámetros. En vez de adivinar, el programa prueba muchas combinaciones y se queda con la mejor. Para saber cuál es mejor usamos validación cruzada: partimos el Train en 5 pedazos, entrenamos con 4 y probamos con el que quedó afuera, y repetimos 5 veces. Así elegimos la mejor combinación sin tocar el Test.

**9. Evaluar en el Test.**
Ahora sí se abre el Test y se mide cuánto acertó cada modelo, con varias métricas (Accuracy, Precision, Recall, F1, AUC). No alcanza con mirar solo el porcentaje de aciertos, porque hay errores de dos tipos y uno es mucho más grave que el otro (ver Parte 3).

**10. La pregunta particular de tu caso: los valores faltantes.**
Como el problema de este dataset son los huecos, probamos seis formas de tratarlos y comparamos. Resultado: borrar a los pacientes incompletos empeora mucho todo (porque se borran sobre todo enfermos y el modelo casi no ve enfermos). Rellenar los huecos de cualquier forma funciona bien y casi igual.

**11. Discusión y conclusiones.**
Es contar qué significan los resultados, qué salió raro, qué limitaciones hay y qué haríamos con más tiempo.

---

## Parte 2. Las siglas

### Las variables del dataset (las que aparecen en el trabajo)

| Sigla | En inglés | Qué es |
|---|---|---|
| `age` | age | Edad en años |
| `bp` | blood pressure | Presión arterial |
| `sg` | specific gravity | Gravedad específica de la orina: qué tan concentrada está. Un riñón sano concentra bien, uno enfermo no |
| `al` | albumin | Albúmina en la orina (0 a 5). Es una proteína que un riñón sano no deja pasar. Si aparece, hay daño |
| `su` | sugar | Azúcar en la orina (0 a 5) |
| `rbc` | red blood cells | Glóbulos rojos en el examen de orina, marcados como `normal` o `abnormal` |
| `pc` | pus cell | Células de pus (`normal` o `abnormal`). Indican infección o inflamación |
| `pcc` | pus cell clumps | Grumos de células de pus (`present` o `notpresent`) |
| `ba` | bacteria | Bacterias (`present` o `notpresent`) |
| `bgr` | blood glucose random | Glucosa (azúcar) en sangre tomada en cualquier momento |
| `bu` | blood urea | Urea en sangre. Es un desecho que el riñón debería filtrar. Si sube, el riñón falla |
| `sc` | serum creatinine | Creatinina en sangre. También la filtra el riñón. Es el marcador más usado para saber si los riñones andan bien |
| `sod` | sodium | Sodio en sangre |
| `pot` | potassium | Potasio en sangre |
| `hemo` | hemoglobin | Hemoglobina: la proteína de los glóbulos rojos. Baja en la anemia |
| `pcv` | packed cell volume | Hematocrito: qué porcentaje de la sangre son glóbulos rojos |
| `wbcc` | white blood cell count | Cantidad de glóbulos blancos (los que defienden). En el original se llama `wc` |
| `rbcc` | red blood cell count | Cantidad de glóbulos rojos en sangre. En el original se llama `rc` |
| `htn` | hypertension | Hipertensión (`yes`/`no`) |
| `dm` | diabetes mellitus | Diabetes (`yes`/`no`) |
| `cad` | coronary artery disease | Enfermedad de las arterias del corazón (`yes`/`no`) |
| `appet` | appetite | Apetito (`good`/`poor`) |
| `pe` | pedal edema | Hinchazón en los pies (`yes`/`no`) |
| `ane` | anemia | Anemia (`yes`/`no`) |
| `class` | class | Lo que queremos predecir: `ckd` (con ERC) o `notckd` (sin ERC) |

Cuidado con no confundir **`rbc`** (un examen de orina, con respuesta normal/anormal) con **`rbcc`** (cuántos glóbulos rojos hay en sangre, un número).

**Cómo leer la frase que no entendías:**
> "Las variables con más faltantes son `rbc` (38 %), `rbcc` (33 %), `wbcc` (26 %), `pot` y `sod` (22 %) y `pcv` (18 %)."

Quiere decir: del examen de glóbulos rojos en orina, el 38 % de los pacientes no tiene el dato anotado (38 pacientes de cada 100 tienen ese casillero vacío). Del conteo de glóbulos rojos en sangre falta en el 33 %, del de glóbulos blancos en el 26 %, del potasio y del sodio en el 22 %, y del hematocrito en el 18 %. Son las columnas con más huecos.

### Siglas del trabajo y de Machine Learning

| Sigla | Significa | Qué es, en simple |
|---|---|---|
| ERC / CKD | Enfermedad Renal Crónica / Chronic Kidney Disease | Lo que queremos detectar |
| UCI | University of California, Irvine | El repositorio público de donde salen los datos |
| EDA | Exploratory Data Analysis | El análisis exploratorio: mirar los datos antes de modelar |
| ML | Machine Learning | Programas que aprenden de ejemplos |
| Train / Test | Entrenamiento / Prueba | Los datos para aprender y los datos para el examen final |
| CV | Cross-Validation (validación cruzada) | Partir el Train en pedazos y rotar cuál se usa para probar |
| Fold | pliegue | Cada uno de esos pedazos (usamos 5) |
| MCAR | Missing Completely At Random | Cuando un dato falta por pura casualidad. Acá NO es así: faltan más en los enfermos |
| KNN | K-Nearest Neighbors | Rellenar un hueco con el promedio de los k pacientes más parecidos (usamos k = 5) |
| MICE | Multiple Imputation by Chained Equations | Rellenar cada hueco con una predicción hecha a partir de las otras variables |
| LR | Logistic Regression | Regresión Logística |
| SVM | Support Vector Machine | Máquina de vectores soporte |
| RBF | Radial Basis Function | El tipo de kernel que permite fronteras curvas |
| RF | Random Forest | Bosque aleatorio |
| MLP | Multi-Layer Perceptron | La red neuronal de capas que usamos |
| ReLU | Rectified Linear Unit | La función de activación de las capas ocultas (deja pasar los positivos y pone 0 a los negativos) |
| Sigmoide | | Función que convierte cualquier número en una probabilidad entre 0 y 1. Va en la última neurona |
| Adam | | El algoritmo que va ajustando la red |
| Dropout | | Apagar neuronas al azar durante el entrenamiento para que la red no memorice |
| Epoch (época) | | Una pasada completa de la red por todos los datos de entrenamiento |
| Batch | | Cuántos pacientes ve la red antes de ajustarse (usamos 32) |
| Early stopping | parada temprana | Cortar el entrenamiento cuando ya no mejora |
| C | | En LR y SVM: cuánto castigo ponemos a los errores. C alto = se ajusta más a los datos |
| gamma | | En la SVM con RBF: qué tan curva puede ser la frontera |
| L1 / L2 | | Dos formas de "regularizar": evitar que el modelo dependa demasiado de una sola variable |
| GridSearchCV | | Probar todas las combinaciones de una grilla de hiperparámetros con validación cruzada |
| Pipeline | | Una cadena de pasos (rellenar, estandarizar, entrenar) que se ejecutan siempre juntos |
| eGFR | estimated Glomerular Filtration Rate | La medida que usan los médicos para diagnosticar ERC. No está en nuestro dataset |

### Las métricas

Primero la matriz de confusión, porque de ahí sale todo. Consideramos "positivo" al enfermo (`ckd`).

| | El modelo dice: enfermo | El modelo dice: sano |
|---|---|---|
| **Realmente enfermo** | VP (verdadero positivo): acierto | **FN (falso negativo): enfermo que se le escapó** |
| **Realmente sano** | FP (falso positivo): falsa alarma | VN (verdadero negativo): acierto |

- **Accuracy**: de todos los pacientes, qué porcentaje acertó. Engaña cuando hay más de una clase que de otra.
- **Precision**: de los que el modelo llamó "enfermos", cuántos realmente lo estaban. Baja si hay muchas falsas alarmas.
- **Recall (sensibilidad)**: de los que realmente estaban enfermos, a cuántos encontró. **Es la más importante en este problema**, porque no detectar a un enfermo es lo más grave.
- **Especificidad**: de los sanos, a cuántos dijo "sano".
- **F1**: un solo número que combina Precision y Recall (si uno de los dos es malo, el F1 es malo).
- **AUC-ROC**: mide qué tan bien el modelo ordena a los pacientes (los enfermos arriba, los sanos abajo), sin importar dónde se ponga el corte. 1,0 es perfecto y 0,5 es tirar una moneda.

---

## Parte 3. Preguntas que puede hacerte el profesor

Las respuestas están para que las digas con tus palabras. Lo importante es que entiendas la idea, no que las repitas igual.

### Sobre el problema y los datos

**¿Qué problema resolviste y por qué es útil el ML acá?**
Detectar pacientes con enfermedad renal crónica a partir de análisis de rutina. Es útil porque la enfermedad no da síntomas al principio y hay muchas variables que hay que combinar; el modelo aprende esa combinación de los datos.

**¿Por qué elegiste `ckd` como clase positiva?**
Porque es lo que nos interesa detectar. Así, "falso negativo" significa "enfermo no detectado", que es el error más grave.

**¿Qué desafíos tiene el dataset?**
Tiene variables numéricas y categóricas, un desbalance moderado (62,5 % enfermos y 37,5 % sanos) y muchos valores faltantes: el 10,5 % de las celdas, y solo 158 de 400 pacientes tienen todo completo.

**¿Por qué el desbalance no te preocupó tanto?**
Porque es moderado (1,67 a 1). Igual lo tuve en cuenta: separé los datos de forma estratificada (para que el Train y el Test tengan la misma proporción de enfermos) y no usé solo Accuracy.

**¿Qué es estratificar?**
Que al dividir los datos, cada parte conserve la misma proporción de clases. Así el Test no queda por casualidad con demasiados sanos o demasiados enfermos.

**¿Por qué tratás `sg`, `al` y `su` como números si en el archivo son categorías?**
Porque tienen un orden natural (la albúmina 3 es más que la 1). Si las pasara a categorías separadas (one-hot) se perdería ese orden.

### Sobre el preprocesamiento

**¿Por qué estandarizaste?**
Para que todas las variables estén en la misma escala. La Regresión Logística, la SVM y la red neuronal son sensibles a eso: sin estandarizar, las variables con números grandes pesarían más solo por su tamaño. El Random Forest no lo necesita.

**¿Por qué imputaste con la mediana y no con la media?**
Porque la creatinina y la urea tienen valores extremos reales (creatinina de hasta 76). La media se corre por esos valores y la mediana no.

**¿Por qué no eliminaste los valores extremos (outliers)?**
Porque no son errores: son pacientes muy enfermos, y son justo los más informativos.

**¿Qué es el data leakage y cómo lo evitaste?**
Es cuando el modelo usa información del Test, aunque sea sin querer. Lo evité metiendo todo el preprocesamiento dentro de un Pipeline, así en cada paso se aprende solo con los datos de entrenamiento.

**¿Por qué no hiciste el escalado y la imputación antes de dividir en Train y Test?**
Porque la media, el desvío y la mediana calculados con todos los datos ya "saben" cosas del Test. Eso es leakage.

### Sobre el protocolo

**¿Por qué 80/20?**
Es una proporción habitual. Con 400 pacientes deja 320 para entrenar (suficiente) y 80 para probar. El Test es chico, por eso cada paciente vale 1,25 puntos de Accuracy.

**¿Cuál es la diferencia entre validación y test?**
La validación (la validación cruzada) sirve para elegir el modelo y sus hiperparámetros, y se hace dentro del Train. El Test se toca una sola vez, al final, para medir cuánto va a andar en datos nuevos.

**¿Por qué validación cruzada de 5 folds?**
Porque con pocos datos, un solo pedazo de validación puede dar un número por casualidad. Con 5 folds cada paciente se usa una vez para validar y el promedio es más estable.

**¿Qué pasaría si elegís los hiperparámetros mirando el Test?**
El Test dejaría de ser un examen justo: elegiría lo que mejor le sale a esos 80 pacientes y el resultado sería demasiado optimista.

### Sobre los modelos

**¿Cómo funciona la Regresión Logística?**
Combina las variables con un peso cada una y transforma el resultado en una probabilidad entre 0 y 1 con la función sigmoide. Si la probabilidad pasa de 0,5, dice "enfermo".

**¿Qué hace `C` en la Regresión Logística y en la SVM?**
Controla cuánto se castigan los errores. `C` alto se ajusta mucho a los datos de entrenamiento (riesgo de sobreajuste); `C` bajo es más flexible y simple.

**¿Qué es L1 y L2?**
Dos formas de evitar que el modelo dependa demasiado de una variable. L2 achica los coeficientes; L1 puede llevar algunos a cero (elimina variables).

**¿Cómo funciona la SVM?**
Busca la línea que separa las dos clases dejando el mayor margen posible entre ellas. Los puntos más cercanos a esa línea (vectores soporte) son los que la definen. Con el kernel RBF puede hacer fronteras curvas.

**¿Qué hace gamma?**
En el kernel RBF define cuánto alcance tiene cada punto. Gamma alto hace fronteras muy pegadas a los datos (riesgo de sobreajuste); gamma bajo hace fronteras más suaves.

**¿Por qué elegiste kernel RBF si el problema es casi lineal?**
La búsqueda lo eligió por ser marginalmente mejor, pero el kernel lineal casi empata (F1 0,995 contra 0,9975 en validación cruzada). Es decir, la no linealidad aporta muy poco, lo que confirma que las clases son casi separables con una recta.

**¿Cómo funciona el Random Forest y por qué lo elegiste?**
Entrena muchos árboles de decisión, cada uno con una muestra distinta de pacientes y de variables, y decide por votación. Al promediar muchos árboles baja el riesgo de sobreajustar. Lo elegí porque no necesita estandarizar, aguanta bien los valores extremos y las variables parecidas entre sí (`hemo`, `pcv`, `rbcc`), y porque en la literatura es de los mejores para este dataset.

**Describí tu red neuronal.**
Entra con las 24 variables. Tiene una capa oculta de 8 neuronas con ReLU y dropout de 0,3, y una neurona final con sigmoide que da la probabilidad de enfermedad. Pierde con entropía cruzada binaria, se optimiza con Adam (tasa de aprendizaje 0,003), batch de 32, hasta 300 épocas con parada temprana.

**¿Qué es el dropout?**
Apagar al azar una parte de las neuronas en cada paso del entrenamiento, para que la red no dependa de unas pocas y no memorice.

**¿Qué es el early stopping y por qué lo usaste?**
Se separa un 20 % del Train como validación interna y se corta el entrenamiento cuando el error en esa parte deja de mejorar durante 20 épocas. Evita el sobreajuste y nunca usa el Test.

**¿Por qué la red neuronal anduvo peor que los otros modelos?**
Con unos 256 pacientes de entrenamiento no tiene ventaja sobre modelos más simples y es más sensible a los valores extremos. Vi un caso concreto: un paciente con creatinina 32 y urea 391, muy enfermo, que la red clasificó como sano con probabilidad casi 0. Fuera del rango que vio en el entrenamiento, la red extrapola mal.

### Sobre las métricas y los resultados

**¿Por qué el Random Forest sacó 100 %? ¿No es sospechoso?**
Es esperable en este dataset: las clases están casi separadas (se ve en los gráficos) y otros trabajos publicados llegan a 98 o 99 %. Además controlé que no haya leakage y que la validación cruzada (F1 de 0,995) y el Test coincidan. Aun así, el Test tiene solo 80 pacientes, así que no digo que el modelo sea perfecto: digo que en estos 80 no falló.

**¿Cuál es la métrica más importante en tu problema y por qué?**
El Recall, porque el error más grave es no detectar a un enfermo. Con un falso negativo el paciente no recibe tratamiento a tiempo. Un falso positivo, en cambio, solo lleva a pedir más estudios.

**¿Por qué usaste F1 para elegir hiperparámetros y no Accuracy?**
Porque el F1 combina Precision y Recall de la clase enferma. Con Accuracy, un modelo que dijera siempre "enfermo" ya tendría 62,5 %.

**¿Qué es el AUC?**
La probabilidad de que el modelo le dé un puntaje más alto a un enfermo que a un sano elegidos al azar. Va de 0,5 (moneda) a 1 (perfecto) y no depende del corte de 0,5.

**Todos tus modelos anduvieron muy bien. ¿Cuál es mejor?**
El Random Forest, porque fue el único que no dejó escapar ningún enfermo. Pero las diferencias son de 1 a 3 pacientes sobre 80, y eso está dentro de lo que varía por casualidad, así que no puedo asegurar que uno sea estadísticamente mejor. Los cuatro resuelven bien el problema.

**¿Hay sobreajuste?**
No veo evidencia. La diferencia entre el rendimiento en entrenamiento y en validación cruzada es de 0,005 o menos, y el Test coincide con la validación cruzada.

**¿Qué es sobreajuste?**
Cuando el modelo memoriza los datos de entrenamiento, incluido el ruido, y después anda mal con datos nuevos.

**¿Cómo eran los pacientes que los modelos no detectaron?**
Tres pacientes con ERC. Dos tenían valores casi normales (hemoglobina 13,9 y 16,1, sin hipertensión ni diabetes), probablemente en etapa muy temprana. El tercero es el caso de creatinina 32 que confundió a la red.

**¿Qué variables fueron más importantes?**
Hemoglobina, gravedad específica, hematocrito, albúmina, creatinina, hipertensión y diabetes. Todas tienen sentido médico: anemia por falla renal, riñón que no concentra la orina, proteínas que se pierden por orina, y los dos factores de riesgo principales.

### Sobre la pregunta particular (valores faltantes)

**¿Qué hiciste con los valores faltantes?**
Comparé seis formas: borrar filas incompletas, borrar columnas con muchos huecos, mediana, mediana más un indicador de "faltaba", KNN y MICE. Mantuve iguales los hiperparámetros para que la única diferencia fuera el tratamiento de los huecos.

**¿Qué encontraste?**
Que borrar a los pacientes incompletos es lo peor: el F1 baja de 0,99 a 0,81 o 0,92 y el Recall a 0,69 o 0,86. En cambio, cualquier forma de rellenar da resultados casi iguales entre sí.

**¿Por qué borrar filas es tan malo?**
Por dos motivos. Uno, se pierde el 62 % de los datos de entrenamiento. Dos, los datos no faltan al azar: a los enfermos les faltan muchos más (3,6 datos en promedio contra 0,7 en los sanos), entonces las filas completas son casi todas de sanos. Los enfermos pasan de ser el 62,5 % a ser el 26,5 % de lo que ve el modelo, y aprende mal a reconocerlos.

**¿Qué significa que los datos no son MCAR?**
Que la falta de un dato no es casualidad: depende de la clase. Si fuera casualidad (MCAR), borrar filas solo perdería datos, pero no sesgaría.

**¿Por qué no usaste la estrategia con indicadores de faltante, si dio el mejor resultado?**
Porque un modelo que solo mira qué datos faltan (sin ningún valor médico) ya predice con AUC de 0,86. Eso significa que la ausencia de datos depende de cómo registró la información ese hospital, y en otro hospital esa señal puede no existir. Prefiero la mediana, que da casi lo mismo y es más segura.

**¿Cuál es tu conclusión sobre los faltantes?**
Que es la decisión de preprocesamiento que más pesó, más que elegir un modelo u otro. Hay que conservar a todos los pacientes e imputar dentro del Pipeline. Qué método de imputación se use es secundario en este dataset.

### Preguntas generales

**¿Este modelo se podría usar en un hospital?**
No todavía. Es un dataset chico (400 pacientes) de un solo hospital de la India, no incluye el estadio de la enfermedad ni la tasa de filtración glomerular (eGFR), que es lo que usan los médicos, y los datos faltantes están asociados a la clase. Serviría como apoyo de tamizaje después de validarlo con datos de otros centros.

**¿Qué harías con más tiempo?**
Validar con un dataset externo, usar validación cruzada anidada, ajustar el umbral de decisión para priorizar el Recall, probar XGBoost, y explicar cada predicción con SHAP.

**¿Qué fue lo más difícil o lo que más te sorprendió?**
Una respuesta sincera y verdadera para vos. Una opción: "me sorprendió que el modelo no fuera lo más importante, sino cómo tratar los datos que faltan".

**¿Qué cambiarías si tuvieras que repetirlo?**
Transformaría con logaritmo la creatinina, la urea y la glucosa para la red neuronal, y usaría más de una partición Train/Test para tener una estimación más estable.

---

## Consejos para el día de la defensa

- Si no sabés algo, no inventes. Decí: "esa parte no la profundicé, pero lo que entiendo es…" y explicá lo que sí sabés.
- Practicá el guion de 5 minutos con reloj. Si te pasás, sacá detalles, no conclusiones.
- Abrí el notebook antes y ubicá: dónde está el Pipeline (sección 4), el GridSearchCV (sección 6), la tabla de resultados (sección 8) y el experimento de faltantes (sección 9). El profesor puede pedirte que muestres una parte del código.
- Sobre el código, lo esencial es poder decir qué hace cada bloque, no cada línea.
