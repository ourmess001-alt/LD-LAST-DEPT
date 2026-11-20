import math
import random
from PIL import Image

def generate_studio_backdrop():
    width = 2048
    height = 1152
    img = Image.new('RGB', (width, height))
    pixels = img.load()

    # Colors derived from user uploaded reference image:
    # Top: warm charcoal taupe (108, 95, 106)
    # Upper-Mid: (90, 79, 88)
    # Mid-Lower: (58, 50, 58)
    # Bottom: deep velvety charcoal (24, 22, 26)

    cx = width / 2.0
    cy = height * 0.45

    for y in range(height):
        ny = y / float(height)

        # Smooth vertical studio curve
        if ny < 0.40:
            t = ny / 0.40
            r_base = 112 * (1 - t) + 94 * t
            g_base = 98 * (1 - t) + 82 * t
            b_base = 110 * (1 - t) + 92 * t
        elif ny < 0.75:
            t = (ny - 0.40) / 0.35
            r_base = 94 * (1 - t) + 52 * t
            g_base = 82 * (1 - t) + 46 * t
            b_base = 92 * (1 - t) + 52 * t
        else:
            t = (ny - 0.75) / 0.25
            r_base = 52 * (1 - t) + 24 * t
            g_base = 46 * (1 - t) + 22 * t
            b_base = 52 * (1 - t) + 26 * t

        for x in range(width):
            # Soft subtle horizontal/radial studio vignette
            dx = (x - cx) / (width * 0.6)
            dy = (y - cy) / (height * 0.6)
            dist_sq = dx * dx + dy * dy
            vignette = 1.0 - min(0.22, dist_sq * 0.16)

            # 1-LSB dither to prevent any color banding
            dither = random.uniform(-0.8, 0.8)

            r = max(0, min(255, int(r_base * vignette + dither)))
            g = max(0, min(255, int(g_base * vignette + dither)))
            b = max(0, min(255, int(b_base * vignette + dither)))

            pixels[x, y] = (r, g, b)

    out_path = 'public/images/studio_minimal_backdrop.png'
    img.save(out_path, 'PNG', optimize=True)
    print(f'Successfully generated {out_path} ({width}x{height})')

if __name__ == '__main__':
    generate_studio_backdrop()

