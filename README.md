# Worldcup Access

A Next.js 15 application with TypeScript, Tailwind CSS, and shadcn/ui.

## Tech stack

- **Next.js 15** — App Router with Turbopack
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**

## Project structure

```
src/
├── app/                 # App Router pages and layouts
├── components/
│   ├── layout/          # Site-wide layout components
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
└── lib/                 # Utilities and shared logic
```

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start dev server         |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## Adding shadcn/ui components

```bash
npx shadcn@latest add [component]
```
