"""Recorta el heatmap (panel izquierdo) de figuras/13_faltantes_cv.png para el póster."""
import numpy as np
from PIL import Image

im = Image.open("../figuras/13_faltantes_cv.png")
gris = np.asarray(im.convert("L"))
vacias = (gris < 245).sum(axis=0) == 0          # columnas completamente blancas
w = im.size[0]
# último tramo blanco (> 8 px) antes del 60 % del ancho = separación entre los dos paneles
corte, inicio = int(w * 0.55), None
for x in range(int(w * 0.6)):
    if vacias[x] and inicio is None:
        inicio = x
    elif not vacias[x] and inicio is not None:
        if x - inicio > 8:
            corte = (inicio + x) // 2
        inicio = None
im.crop((0, 0, corte, im.size[1])).save("poster_heatmap_faltantes.png")
print("Recorte en x =", corte)
