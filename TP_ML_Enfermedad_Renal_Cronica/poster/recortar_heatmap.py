"""Recorta el heatmap (panel izquierdo) de figuras/13_faltantes_cv.png para el póster."""
from PIL import Image
im = Image.open("../figuras/13_faltantes_cv.png")
w, h = im.size
im.crop((0, 0, int(w * 0.555), h)).save("poster_heatmap_faltantes.png")
