# Recurse

> **Practice less. Remember more.**

Recurse is a spaced-repetition review engine for LeetCode-style coding problems. Instead of grinding hundreds of problems you instantly forget, Recurse uses the **FSRS algorithm** to surface each problem at the precise moment forgetting begins — turning passive practice into durable retention.

---

## Value Propositions

### 🧠 Adaptive Spacing
Review fewer problems, remember more. FRFS schedules each problem at the exact moment your memory begins to fade — so every session compounds instead of resets.

### ⚡ Queue, Not Grind
A daily review queue that takes 15 minutes, not 3 hours. Problems you've solved become problems you *own*. No more re-solving the same problem from scratch six months later.

### 📡 Signal, Not Noise
No streaks for their own sake, no gamification fluff. Just what's due, when you solved it, and how your interval is growing. Pure signal.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Animation | [GSAP 3](https://gsap.com/) + ScrollTrigger |
| Icons | [Lucide React](https://lucide.dev/) |
| Runtime | Node.js ≥ 18 |

---


## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or `pnpm` / `yarn`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/_Recurse.git
cd _Recurse

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.



## Contributing

Contributions are welcome! Here's how to get involved:

### Workflow

1. **Fork** the repository and clone your fork locally.
2. **Create a branch** for your change:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes**, following the conventions below.
4. **Commit** using conventional commits:
   ```bash
   git commit -m "feat: add interval history chart to queue card"
   ```
5. **Push** your branch and open a **Pull Request** against `main`.

### Code Conventions

- **TypeScript** — all new components must be fully typed; avoid `any`.
- **Component scope** — one component per file in `src/components/`.
- **Tailwind** — use existing design tokens; do not introduce ad-hoc arbitrary values unless strictly necessary.
- **Naming** — PascalCase for components, camelCase for utilities and hooks.

### Reporting Issues

Please open a GitHub Issue with:
- A clear description of the bug or feature request
- Steps to reproduce (for bugs)
- Screenshots or recordings if applicable

---

