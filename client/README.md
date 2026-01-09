# BanThuoc Client

This is the frontend application for the BanThuoc B2B platform, built with **Next.js 15+**, **React 19**, **Tailwind CSS 4**, and **Shadcn/UI**.

## Project Structure

The project follows a **Feature-based Architecture** to ensure scalability and maintainability.

```
client/
├── app/                    # Next.js App Router (File-system based routing)
│   ├── auth/               # Auth routes (login, register)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
│
├── components/             # Shared Components
│   └── ui/                 # Reusable UI components (buttons, inputs, modals...)
│       ├── button.tsx
│       ├── input.tsx
│       ├── dropzone-upload.tsx
│       └── success-modal.tsx
│
├── src/                    # Source Code
│   └── features/           # Feature-based modules
│       └── auth/           # Authentication Feature
│           ├── api/        # API calls (axios wrappers)
│           ├── components/ # Feature-specific components (forms, etc.)
│           ├── stores/     # State management (Zustand)
│           └── types/      # TypeScript interfaces/schemas (Zod)
│
├── public/                 # Static assets (images, icons)
├── styles/                 # Global styles (if any)
├── .env.local              # Environment variables
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── package.json            # Dependencies and scripts
```

## Key Technologies

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Component Library**: Shadcn/UI
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Animations**: Framer Motion
- **HTTP Client**: Axios

## Getting Started

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Run development server**:
    ```bash
    pnpm dev
    ```

3.  **Build for production**:
    ```bash
    pnpm build
    ```
