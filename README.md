# LD LAST DEPT. — 3D Digital Footwear Exhibition & Showroom

An interactive, production-grade 3D sneaker exhibition showroom built with **Next.js**, **React Three Fiber (Three.js)**, **Tailwind CSS**, **Framer Motion**, and **Zustand**.

🔗 **Live GitHub Repository:** [https://github.com/tsourov211-eng/LD-LAST-DEPT](https://github.com/tsourov211-eng/LD-LAST-DEPT)

---

## 🌟 Key Features

- **10 Real 3D GLB Footwear Silhouettes:**
  - Iconic models (Gazelle, Air Max 90, Forum Buckle, Dunk Low, Air Jordan 1, Vans Old Skool, Chuck Taylor, Puma Suede, Bape Sta, Forge Runner).
  - Normalized geometry sitting flush on display plinths without clipping.
- **Architectural Dual-Tier Plinths:**
  - Matte anodized obsidian black top pedestal.
  - Suspended optical crystal glass slab with polished refraction edges.
  - Precision chrome standoff pins and recessed glowing amber neon bars.
- **Interactive 3D Turntable Inspection:**
  - Smooth camera interpolation (`CameraRig`) into close-up 360° orbit inspection.
  - Horizontal drag rotation and subtle idle floating/auto-spin.
- **Global Search & Command Palette (`⌘K` / `/`):**
  - Instant fuzzy search by silhouette name, index code, category, tier, or colorway.
  - Quick category filter chips (`Runner`, `Basketball`, `Court`, `Skate`, `High-Top`).
  - Spatial keyboard navigation (<kbd>↑</kbd> / <kbd>↓</kbd> / <kbd>Enter</kbd> to inspect in 3D).
- **Interactive Purchasing & Customization HUD:**
  - Real-time dynamic price calculation.
  - Colorway swatches with active selection ring.
  - Accessible EU size selector dropdown.
  - Quantity stepper (`-` / `+`).
  - Animated "Add to Bag" feedback.
- **Slide-out Cart Drawer:**
  - Dynamic quantity management, live subtotal, and exhibition checkout.
- **Architectural Anatomy Bento Grid:**
  - Apple/luxury-style modular bento grid showcasing material specs, damping latency, and biomechanics.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **3D Graphics:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Post-processing:** Bloom (`@react-three/postprocessing`)
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Animations:** Framer Motion, Lucide React Icons

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/tsourov211-eng/LD-LAST-DEPT.git

# Enter directory
cd LD-LAST-DEPT

# Install dependencies (pnpm recommended)
pnpm install

# Start local dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build

```bash
pnpm build
pnpm start
```
