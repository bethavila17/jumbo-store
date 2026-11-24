"""Imagen explicativa de la Regresión Logística con los datos reales del TP (mismo protocolo del notebook)."""
import sys
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OrdinalEncoder, StandardScaler

ARFF, SALIDA = sys.argv[1], sys.argv[2]
NUM = ["age", "bp", "sg", "al", "su", "bgr", "bu", "sc", "sod", "pot", "hemo", "pcv", "wbcc", "rbcc"]
CAT = ["rbc", "pc", "pcc", "ba", "htn", "dm", "cad", "appet", "pe", "ane"]
CATS = {"rbc": ["normal", "abnormal"], "pc": ["normal", "abnormal"], "pcc": ["notpresent", "present"],
        "ba": ["notpresent", "present"], "htn": ["no", "yes"], "dm": ["no", "yes"], "cad": ["no", "yes"],
        "appet": ["good", "poor"], "pe": ["no", "yes"], "ane": ["no", "yes"]}
NOMBRE = {"hemo": "Hemoglobina", "sg": "Gravedad específica", "pcv": "Hematocrito", "sc": "Creatinina",
          "htn": "Hipertensión", "appet": "Apetito pobre", "rbcc": "Glóbulos rojos (sangre)", "dm": "Diabetes",
          "cad": "Enf. coronaria", "bgr": "Glucosa", "al": "Albúmina", "su": "Azúcar en orina",
          "pe": "Edema", "ane": "Anemia", "bu": "Urea", "sod": "Sodio", "pot": "Potasio", "age": "Edad",
          "bp": "Presión", "wbcc": "Glóbulos blancos", "rbc": "Glóbulos rojos (orina)", "pc": "Células de pus",
          "pcc": "Grumos de pus", "ba": "Bacterias"}

# --- lectura tolerante del ARFF (igual que el notebook) ---
attrs, filas, datos = [], [], False
for l in open(ARFF, encoding="latin-1"):
    l = l.strip()
    if not l or l.startswith("%"):
        continue
    if l.lower().startswith("@attribute"):
        attrs.append(l.split()[1].strip("'"))
    elif l.lower().startswith("@data"):
        datos = True
    elif datos:
        v = [x.strip() for x in l.split(",")]
        if len(v) != len(attrs):
            v = [x for x in v if x != ""]
        if len(v) == len(attrs):
            filas.append(v)
df = pd.DataFrame(filas, columns=attrs).replace({"?": np.nan, "": np.nan})
for c in df.columns:
    if df[c].dtype == object:
        df[c] = df[c].str.replace("\t", "").str.strip().replace({"?": np.nan, "": np.nan})
for c in NUM:
    df[c] = pd.to_numeric(df[c], errors="coerce")
X, y = df[NUM + CAT], (df["class"] == "ckd").astype(int)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

pipe = Pipeline([
    ("codificar", ColumnTransformer([("num", "passthrough", NUM),
                                     ("cat", OrdinalEncoder(categories=[CATS[c] for c in CAT],
                                                            handle_unknown="use_encoded_value", unknown_value=np.nan,
                                                            encoded_missing_value=np.nan), CAT)])),
    ("escalar", StandardScaler()),
    ("imputar", SimpleImputer(strategy="median")),
    ("modelo", LogisticRegression(C=10, penalty="l2", solver="liblinear", max_iter=5000, random_state=42)),
]).fit(Xtr, ytr)

z = pipe.decision_function(Xte)
p = 1 / (1 + np.exp(-z))
pred = (p >= 0.5).astype(int)
fn = int(((pred == 0) & (yte.values == 1)).sum()); fp = int(((pred == 1) & (yte.values == 0)).sum())
print("FN", fn, "FP", fp, "acc", (pred == yte.values).mean())

coef = pd.Series(pipe.named_steps["modelo"].coef_.ravel(), index=NUM + CAT)
top = coef.reindex(coef.abs().sort_values(ascending=False).index[:10])[::-1]

# --- figura ---
ROJO, AZUL = "#C0392B", "#2E86C1"
INK, MUTED, GRID, SURF = "#1d2433", "#5a6478", "#e3e7ee", "#fcfcfb"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 12, "axes.edgecolor": GRID,
                     "axes.labelcolor": INK, "xtick.color": MUTED, "ytick.color": MUTED})
fig, (a1, a2) = plt.subplots(1, 2, figsize=(16, 7.2), gridspec_kw={"width_ratios": [1.25, 1]}, facecolor=SURF)
for a in (a1, a2):
    a.set_facecolor(SURF)
    for s in ("top", "right"):
        a.spines[s].set_visible(False)

# Panel 1: curva sigmoide con los pacientes de Test
lim = 16
zc = np.clip(z, -lim + 0.4, lim - 0.4)  # los pocos puntajes más extremos se dibujan en el borde
zz = np.linspace(-lim, lim, 400)
a1.axhspan(0.5, 1.05, color=ROJO, alpha=0.05, lw=0)
a1.axhspan(-0.05, 0.5, color=AZUL, alpha=0.05, lw=0)
a1.plot(zz, 1 / (1 + np.exp(-zz)), color=INK, lw=2, zorder=2)
a1.axhline(0.5, color=MUTED, lw=1.2, ls="--", zorder=1)
a1.axvline(0, color=GRID, lw=1, zorder=0)
rng = np.random.default_rng(0)
for clase, color, etiqueta, marca in [(0, AZUL, "Sano real (notckd)", "o"), (1, ROJO, "Enfermo real (ckd)", "o")]:
    m = yte.values == clase
    a1.scatter(zc[m], p[m] + rng.uniform(-0.012, 0.012, m.sum()), s=70, color=color, edgecolor=SURF, linewidth=1.6,
               marker=marca, zorder=3, label=etiqueta)
err = (pred != yte.values)
a1.scatter(zc[err], p[err], s=260, facecolor="none", edgecolor=INK, linewidth=2, zorder=4,
           label=f"Error: enfermo que pasó como sano ({fn})")
a1.text(-lim + 0.4, 0.93, "Arriba de 0,5:\nel modelo dice ENFERMO", color=ROJO, fontsize=12, fontweight="bold", va="top")
a1.text(lim - 0.4, 0.07, "Abajo de 0,5:\nel modelo dice SANO", color=AZUL, fontsize=12, fontweight="bold", ha="right", va="bottom")
a1.text(lim - 0.3, 0.515, "corte = 0,5", color=MUTED, fontsize=11, ha="right", va="bottom")
a1.set_xlim(-lim, lim); a1.set_ylim(-0.05, 1.05)
a1.set_xlabel("Puntaje del paciente  (suma de: peso × valor de cada análisis)\nlos puntajes mayores a 16 se dibujan en el borde", fontsize=12)
a1.set_ylabel("Probabilidad de estar enfermo", fontsize=12)
a1.set_yticks([0, 0.25, 0.5, 0.75, 1]); a1.set_yticklabels(["0", "0,25", "0,5", "0,75", "1"])
a1.grid(axis="y", color=GRID, lw=0.8)
a1.set_title("Pasos 2 y 3: la sigmoide convierte el puntaje en probabilidad\n80 pacientes de Test, cada punto es uno",
             loc="left", fontsize=14, color=INK, fontweight="bold")
a1.legend(loc="upper left", bbox_to_anchor=(0.0, 0.80), frameon=True, facecolor=SURF, edgecolor=GRID, framealpha=1, fontsize=11)

# Panel 2: pesos aprendidos
col = [ROJO if v > 0 else AZUL for v in top.values]
a2.barh([NOMBRE[i] for i in top.index], top.values, color=col, height=0.62, edgecolor=SURF, linewidth=2)
a2.axvline(0, color=MUTED, lw=1.2)
for i, v in enumerate(top.values):
    a2.text(v + (0.06 if v > 0 else -0.06), i, f"{v:+.2f}".replace(".", ","), va="center",
            ha="left" if v > 0 else "right", color=INK, fontsize=11)
m = np.abs(top.values).max() * 1.35
a2.set_xlim(-m, m)
a2.grid(axis="x", color=GRID, lw=0.8); a2.set_axisbelow(True)
a2.tick_params(axis="y", labelsize=12, colors=INK)
a2.set_xlabel("Peso aprendido (variables estandarizadas)", fontsize=12)
a2.set_title("Paso 1: el peso que aprendió para cada análisis\nlas 10 variables con más peso",
             loc="left", fontsize=14, color=INK, fontweight="bold")
a2.set_ylim(-0.6, len(top) + 0.2)
a2.text(m * 0.97, len(top) - 0.25, "empuja hacia ENFERMO →", color=ROJO, ha="right", fontsize=11, fontweight="bold")
a2.text(-m * 0.97, len(top) - 0.25, "← empuja hacia SANO", color=AZUL, ha="left", fontsize=11, fontweight="bold")

fig.suptitle("Cómo decide la Regresión Logística  ·  Caso 3, enfermedad renal crónica (C = 10, L2)",
             x=0.01, ha="left", fontsize=16, fontweight="bold", color=INK, y=1.0)
fig.tight_layout()
fig.savefig(SALIDA, dpi=160, bbox_inches="tight", facecolor=SURF)
print("guardado", SALIDA)
print(top.round(2).to_string())
