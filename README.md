# ContextMirror — See How Your Look Works Before The Real World Does

> **YouCam API Skin AI & Apparel VTO Hackathon — Track 3: Skin AI + Apparel VTO**  
> *Built on top of the base repository [Tasfia-17/closetmind](https://github.com/Tasfia-17/closetmind) with substantial original extensions.*

---

## 🌟 Project Overview

**ContextMirror** is a context-aware visual decision simulator for fashion and beauty. Rather than asking *"Does this outfit look good?"*, ContextMirror helps users answer:

> **"Which look is most likely to work for the actual real-world situation I am preparing for?"**

By combining **YouCam Skin AI**, **YouCam Apparel VTO**, personal visual signals, and a custom **Context Stress Test**, ContextMirror evaluates candidates across real-world dimensions (occasion, time of day, environment lighting, photography suitability, color harmony, and style preferences) to produce an explainable **ContextMirror Score** (0–100).

---

## 💡 Problem & Solution

### The Problem
Traditional virtual dressing rooms and generic AI stylists suffer from **contextual blindness**:
- A sleek black silk gown looks stunning on a screen, but fails at a 2 PM outdoor garden party.
- Structured wool blazers look sharp in an office, but restrict movement at an informal evening reception.
- Users experience decision paralysis when trying to choose between candidate looks without knowing how they perform under real-world conditions.

### The Solution: Context Mirror
ContextMirror introduces the **⭐ Context Stress Test**:
1. **Context Setup**: Captures occasion, time of day, venue environment, and formality expectations (via natural language or structured selection).
2. **Personal Visual Profile**: YouCam Skin AI analyzes skin signals, facial attributes, and undertones to establish personal color compatibility baselines.
3. **⭐ Skin Insight & Care Module**: Translates visible Skin AI results into clear explanations (*"The analysis detected visible patterns associated with acne"*), provides non-medical skincare routine guidance, and suggests relevant product categories (*Gentle Cleanser*, *Non-Comedogenic Moisturizer*, *Sunscreen*).
4. **Contextual Smart 3 & YouCam VTO**: Renders 3 candidate looks (*Safe / Classic*, *Fresh / Modern*, *Remix / Bold*) directly on the user's reference selfie.
5. **Context Stress Test & Scoring**: Evaluates candidates across 7 real-world dimensions, displaying the **ContextMirror Score** and highlighting the **⭐ BEST MATCH**.
6. **Fashion Experiments & Decision Replay**: Features **Change One Thing** for controlled single-variable experiments, **Estimated Wardrobe Impact** for versatility metrics, and **Decision Replay** for preference learning.

---

## 🧬 Why Track 3: Skin AI + Apparel VTO Synergy

Track 3 requires a tight, multi-dimensional integration of **Skin AI** and **Apparel VTO** into a single coherent product experience:

```
Personal Visual Profile (YouCam Skin AI)
        ↓
Color & Contrast Harmony Signals
        ↓
Candidate Outfits (Smart 3)
        ↓
Visual Garment Fitting (YouCam Apparel VTO)
        ↓
⭐ Context Stress Test (Context Engine)
        ↓
Final Decision & ContextMirror Score
```

ContextMirror treats skin analysis not as a standalone health metric, but as an active visual signal for garment color harmony and photography light dispersion.

---

## ⭐ Key Features

1. **Natural Language Context Setup**: Converts natural input (*"I have a wedding at 7 PM in an indoor hotel"*) into structured parameters.
2. **Unified Personal Profile**: Integrates YouCam Skin AI metrics (clarity, undertone, hydration) for fashion color guidance without medical claims.
3. **Contextual Smart 3**: Generates Safe, Fresh, and Remix candidates tailored to the event parameters.
4. **YouCam Apparel VTO**: High-fidelity virtual try-on across clothes, shoes, bags, and accessories.
5. **⭐ Context Stress Test**: Evaluates 7 dimensions (*Occasion Fit, Time Fit, Environment Fit, Color Compatibility, Photography Suitability, Style Preference, Wardrobe Compatibility*).
6. **ContextMirror Score**: Weighted 30/25/20/15/10 scoring engine delivering explainable outfit decisions.
7. **3-Look Side-by-Side Comparison**: Clear visual card layout highlighting the **BEST MATCH**.
8. **Change One Thing**: Single-variable experiment mode with instant BEFORE / AFTER score deltas (+6 diff).
9. **Estimated Wardrobe Impact**: Quantifies new outfit combinations (+N combinations) unlocked by candidate pieces.
10. **Decision Replay**: Log event decisions and post-event feedback (`I wore this`, `Liked it`, `Would change`).

---

## 🏗️ Architecture & YouCam API Integration

### Clean API Provider Abstraction (`lib/youcam/`)

To support seamless development during API maintenance or offline evaluation, ContextMirror implements a clean provider abstraction:

```ts
interface SkinProvider {
  analyze(selfieIdOrFile: string | File): Promise<SkinResult>
}

interface ApparelVTOProvider {
  generate(selfieId: string, garmentUrl: string, category?: string): Promise<VTOResult>
}
```

- `MockSkinProvider` & `MockApparelVTOProvider` — Used when `DEMO_MODE=true` or when credentials are absent.
- `YouCamSkinProvider` & `YouCamApparelVTOProvider` — Connects to server-side Next.js route handlers (`/api/skin`, `/api/vto`) when `DEMO_MODE=false`.

### Server-Side Security
All YouCam API requests are proxied via server-side Route Handlers (`app/api/*`). **API keys are never exposed on the client side**.

---

## 🚀 Setup & Running Locally

### Prerequisites
- Node.js 18+
- npm / npx

### Installation

1. Clone the repository and install dependencies:
   ```bash
   cmd /c npm install
   ```

2. Configure environment variables in `.env.local`:
   ```env
   # Demo Mode (set true to test with sample assets without API key)
   NEXT_PUBLIC_DEMO_MODE=true
   
   # Real YouCam API Key (when connecting live S2S APIs)
   PERFECT_CORP_API_KEY=your_youcam_s2s_api_key
   ```

3. Run the development server:
   ```bash
   cmd /c npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📽️ 1-3 Minute Demo Walkthrough

1. **0:00–0:15**: Landing page & problem statement.
2. **0:15–0:45**: Context Setup (*Wedding, 7 PM, Indoor Hotel*).
3. **0:45–1:10**: Personal Profile & YouCam Skin AI sync.
4. **1:10–1:45**: Smart 3 generation & YouCam Apparel VTO visualization.
5. **1:45–2:15**: ⭐ Context Stress Test & Side-by-Side 3-Look Comparison (**BEST MATCH**).
6. **2:15–2:45**: Change One Thing experiment (+6 delta) & Estimated Wardrobe Impact (+8 combinations).
7. **2:45–3:00**: Log Decision Replay & final summary.

---

## 📜 Attribution & Open Source License

ContextMirror is developed for the YouCam API Skin AI & Apparel VTO Hackathon and is built upon the open-source base repository [Tasfia-17/closetmind](https://github.com/Tasfia-17/closetmind).

### Original ContextMirror Contributions:
- Context Setup & Natural Language Parser (`lib/contextEngine.ts`)
- Personal Visual Profile Layer (`lib/profileEngine.ts`)
- ⭐ Context Stress Test Engine & 7-Dimension Evaluator
- Weighted ContextMirror Score Engine (30/25/20/15/10)
- YouCam API Provider Abstraction Layer (`lib/youcam/`)
- Change One Thing Experiment Simulator
- Estimated Wardrobe Impact Calculator
- Decision Replay & Feedback System
- Primary `/test-look` User Journey
