# 破壞式構圖底圖產生器（1920x1080）：撕紙破口、產品切片、撕紙平面、出框、碎字
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

W, H = 1920, 1080
BS = "/home/claude/master/bs/"
A = "/mnt/user-data/attachments/8fdd2d52-2abe-5b0b-a0cb-83307bb1e698/"
OUT = "/home/claude/master/dz/"
RED = (181, 40, 46)
INK = (31, 36, 33)
PAPER = (246, 243, 238)
random.seed(7); np.random.seed(7)

def noise_tex(size, base, amp=10, seed=1):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, amp, (size[1] // 4 + 1, size[0] // 4 + 1, 1))
    n = np.asarray(Image.fromarray(np.clip(n[..., 0] + 128, 0, 255).astype("uint8")).resize(size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2)), dtype=float)[..., None] - 128
    arr = np.clip(np.array(base, float)[None, None, :] + n * 0.6, 0, 255).astype("uint8")
    return Image.fromarray(arr, "RGB")

def jag(points, amp=14, step=10, seed=0):
    """Densify a closed polyline; offset by a smoothed random walk plus fine fibre noise (torn paper)."""
    rng = random.Random(seed); out = []; walk = 0.0
    for i in range(len(points)):
        (x0, y0), (x1, y1) = points[i], points[(i + 1) % len(points)]
        L = math.hypot(x1 - x0, y1 - y0); n = max(2, int(L / 5))
        nx, ny = -(y1 - y0) / (L or 1), (x1 - x0) / (L or 1)
        for k in range(n):
            t = k / n
            walk = 0.85 * walk + rng.gauss(0, amp * 0.45)
            d = max(-amp, min(amp, walk)) + rng.gauss(0, amp * 0.12)
            out.append((x0 + (x1 - x0) * t + nx * d, y0 + (y1 - y0) * t + ny * d))
    return out

def mask_poly(poly, blur=0.6):
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).polygon(poly, fill=255)
    return m.filter(ImageFilter.GaussianBlur(blur))

def grow(m, px):
    return m.filter(ImageFilter.MaxFilter(px * 2 + 1)) if px > 0 else m

def tear_hole(top, under, hole_pts, seed, rim=14):
    """top layer gets a torn hole showing `under`; white paper fibre rim + inner shadow."""
    hole = mask_poly(jag(hole_pts, amp=22, step=12, seed=seed))
    rimmask = mask_poly(jag(hole_pts, amp=26, step=9, seed=seed + 50))
    rimmask = ImageChops.lighter(grow(hole, rim), rimmask)
    out = top.copy()
    paper = noise_tex((W, H), PAPER, 6, seed + 3)
    out.paste(paper, (0, 0), rimmask)                       # paper fibre around the tear
    shadow = Image.new("RGB", (W, H), (0, 0, 0))
    sh = grow(hole, 4).filter(ImageFilter.GaussianBlur(10))
    u = under.copy(); u = Image.composite(Image.blend(u, shadow, 0.35), u, ImageChops.subtract(sh, hole.filter(ImageFilter.MinFilter(25))))
    out.paste(u, (0, 0), hole)
    return out, hole

def fit(img, w, h):
    r = max(w / img.width, h / img.height)
    im = img.resize((int(img.width * r) + 1, int(img.height * r) + 1), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def drop_shadow(canvas, rgba, pos, off=(0, 18), blur=22, alpha=110):
    sh = Image.new("RGBA", rgba.size, (0, 0, 0, 0)); a = rgba.getchannel("A").point(lambda v: v * alpha // 255)
    sh.putalpha(a); big = Image.new("RGBA", canvas.size, (0, 0, 0, 0)); big.alpha_composite(sh, (pos[0] + off[0], pos[1] + off[1]))
    canvas.alpha_composite(big.filter(ImageFilter.GaussianBlur(blur))); canvas.alpha_composite(rgba, pos)

bld = Image.open(A + "f525fe4a-image.png").convert("RGB")
ratchet = Image.open(BS + "sec1.png")  # composed; recut raw cutout instead
from scipy import ndimage
def cutout(im, thr=18):
    a = np.asarray(im.convert("RGB")).astype(int); m = (255 - a.min(-1)) > thr
    m = ndimage.binary_fill_holes(ndimage.binary_closing(m, iterations=2))
    lab, n = ndimage.label(m); s = ndimage.sum(m, lab, range(1, n + 1))
    m = np.isin(lab, [i + 1 for i, v in enumerate(s) if v > 400])
    al = Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8))
    o = im.convert("RGBA"); o.putalpha(al); return o.crop(al.getbbox())
rat = cutout(Image.open(A + "fd52c695-image.png"))
kit = cutout(Image.open(A + "a5e70ff6-image.png"))

# ---------- A 封面：紅紙撕出破口，露出鑽全廠房；棘輪扳手出框 ----------
red = noise_tex((W, H), RED, 9, 11)
under = fit(bld.crop((380, 0, 1442, 503)), W, H)
pts = [(980, 120), (1460, 70), (1820, 230), (1860, 640), (1700, 980), (1220, 1010), (930, 760), (900, 380)]
A_img, hole = tear_hole(red, under, pts, seed=3)
A_img = A_img.convert("RGBA")
r = rat.resize((int(rat.width * 1.05), int(rat.height * 1.05)), Image.LANCZOS).rotate(-18, expand=True, resample=Image.BICUBIC)
drop_shadow(A_img, r, (1180, 160))
A_img.convert("RGB").save(OUT + "cover.jpg", quality=88)

# ---------- B 第一章：產品切片（從產品本身說服）----------
B = noise_tex((W, H), (250, 249, 247), 3, 21).convert("RGBA")
R = rat.resize((int(rat.width * 0.95), int(rat.height * 0.95)), Image.LANCZOS)
cuts = [0, 0.2, 0.36, 0.55, 0.78, 1.0]; y0 = 40; xc = 1380
for i in range(5):
    a, b = int(R.height * cuts[i]), int(R.height * cuts[i + 1])
    seg = R.crop((0, a, R.width, b)).rotate((-1) ** i * 2.5, expand=True, resample=Image.BICUBIC)
    drop_shadow(B, seg, (xc - seg.width // 2 + (-1) ** i * 18, y0 + a + i * 42), off=(0, 10), blur=14, alpha=80)
B.convert("RGB").save(OUT + "sec1.jpg", quality=88)

# ---------- C 第二章：廠房照片 + 撕開的紅色紙條（另一個平面放文字）----------
C = fit(bld.crop((300, 0, 1442, 503)), W, H).convert("RGB")
C = Image.blend(C, Image.new("RGB", (W, H), (40, 40, 40)), 0.12)
strip = [(560, -40), (1060, -40), (980, 1120), (430, 1120)]
redC = noise_tex((W, H), RED, 9, 31)
rim = mask_poly(jag([(p[0] - 16 if i in (0, 3) else p[0] + 16, p[1]) for i, p in enumerate(strip)], amp=24, step=9, seed=8))
body = mask_poly(jag(strip, amp=20, step=12, seed=9))
sh = rim.filter(ImageFilter.GaussianBlur(18))
C = Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), C, sh.point(lambda v: v * 90 // 255))
C.paste(noise_tex((W, H), PAPER, 6, 33), (0, 0), rim); C.paste(redC, (0, 0), body)
C.save(OUT + "sec2.jpg", quality=88)

# ---------- D 第三章：紅底撕出白洞，工具套組衝出破口 ----------
Dbg = noise_tex((W, H), RED, 9, 41)
inner = noise_tex((W, H), PAPER, 5, 42)
pts = [(980, 260), (1500, 210), (1780, 470), (1700, 900), (1180, 960), (900, 700)]
D, hole = tear_hole(Dbg, inner, pts, seed=12)
D = D.convert("RGBA")
k = kit.resize((int(kit.width * 1.45), int(kit.height * 1.45)), Image.LANCZOS)
drop_shadow(D, k, (1340 - k.width // 2, 90))
D.convert("RGB").save(OUT + "sec3.jpg", quality=88)

# ---------- E 第四章：碎字「碳」----------
E = noise_tex((W, H), (250, 249, 247), 3, 51)
font = ImageFont.truetype("/usr/share/fonts/opentype/noto/NotoSerifCJK-Black.ttc", 760, index=3)
glyph = Image.new("L", (W, H), 0); ImageDraw.Draw(glyph).text((1380, 520), "碳", font=font, fill=255, anchor="mm")
rng = random.Random(5)
pieces = Image.new("L", (W, H), 0)
# split by random crack lines into regions, shift each region a little, drop a few shards
lines = [((900, 120 + i * 190 + rng.randint(-60, 60)), (1900, 120 + i * 190 + rng.randint(-120, 120))) for i in range(5)]
yy, xx = np.mgrid[0:H, 0:W]
region = np.zeros((H, W), int)
for (x0, y0), (x1, y1) in lines:
    region += ((yy - y0) * (x1 - x0) - (xx - x0) * (y1 - y0) > 0)
vlines = [((1250 + rng.randint(-40, 40), 0), (1300 + rng.randint(-60, 60), H)), ((1520 + rng.randint(-40, 40), 0), (1480, H))]
for (x0, y0), (x1, y1) in vlines:
    region = region * 2 + ((yy - y0) * (x1 - x0) - (xx - x0) * (y1 - y0) > 0)
g = np.asarray(glyph)
out = np.zeros_like(g)
for rid in np.unique(region):
    m = (region == rid) & (g > 0)
    if not m.any(): continue
    dx, dy = rng.randint(-7, 7), rng.randint(-5, 5)
    if rng.random() < 0.04: continue
    out = np.maximum(out, np.roll(np.roll(np.where(m, g, 0), dy, 0), dx, 1))
# hairline cracks
crack = Image.fromarray(out.astype("uint8")); d = ImageDraw.Draw(crack)
for (x0, y0), (x1, y1) in lines + vlines: d.line([(x0, y0), (x1, y1)], fill=0, width=5)
Ein = Image.new("RGB", (W, H), INK)
E.paste(Ein, (0, 0), crack)
E.save(OUT + "sec4.jpg", quality=90)
print("done")
