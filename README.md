<div align="center">
  <br />
    <a href="https://shop-stack-demo.vercel.app/" target="_blank">
      <h3 align="center">ShopStack</h3>
    </a>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-TanStack_Start-black?style=for-the-badge&logoColor=white&logo=react&color=3068b7" alt="TanStack Start" />
    <img src="https://img.shields.io/badge/-PostgreSQL-black?style=for-the-badge&logoColor=white&logo=postgresql&color=4169E1" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="TypeScript" />
  </div>

   <div align="center">
     A modern, multi-tenant e-commerce starter built with TanStack Start, React 19, and Drizzle ORM.
    </div>
</div>

## 📋 Table of Contents

1. [🤖 Introduction](#introduction)
2. [⚙️ Tech Stack](#tech-stack)
3. [🔋 Features](#features)
4. [🤸 Quick Start](#quick-start)
5. [🔗 Resources](#resources)
6. [🚀 Deployment](#deployment)

## <a name="introduction">🤖 Introduction</a>

**ShopStack** is a production-ready foundation for a marketplace-style commerce platform that combines a storefront, vendor workspace, and admin console into one codebase. It emphasizes a modern React 19 UI, file-based routing, and a type-safe, server-function-first approach to backend logic.

It is designed for three primary audiences:
- **Customers**: Browse products, manage orders, and shop.
- **Vendors**: Manage stores, inventory, staff, and operations.
- **Admins**: Oversee tenants, platform configuration, and global catalogs.

The project features a complete UI structure with authentication and vendor onboarding wired to the database, using mock data for some management pages to showcase layouts while backend modules are completed.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **[TanStack Start](https://tanstack.com/start)**: A full-stack React framework with server-side rendering, file-based routing, and server functions.
- **[TanStack Router](https://tanstack.com/router)**: A fully type-safe router for React applications, providing file-based routing.
- **[TanStack Query](https://tanstack.com/query)**: Powerful asynchronous state management for fetching, caching, and updating server state.
- **[TanStack Table](https://tanstack.com/table)**: Headless UI for building powerful and performant tables and datagrids.
- **[Drizzle ORM](https://orm.drizzle.team/)**: A lightweight and type-safe TypeScript ORM for interacting with the database.
- **[Neon Postgres](https://neon.tech/)**: Serverless Postgres built for the cloud, providing scalability and performance.
- **[Better Auth](https://better-auth.com/)**: Comprehensive authentication library for TypeScript, supporting email/password, social providers, and 2FA.
- **[Tailwind CSS 4](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development with a focus on modern features.
- **[Radix UI](https://www.radix-ui.com/)**: Unstyled, accessible components for building high-quality design systems and web apps.
- **[Zustand](https://zustand-demo.pmnd.rs/)**: A small, fast, and scalable bearbones state-management solution.
- **[Bun](https://bun.sh/)**: A fast all-in-one JavaScript runtime and toolkit.

## <a name="features">🔋 Features</a>

### 🛍️ Storefront
- **Landing & Products**: Dynamic landing page, product listings, and detailed product pages.
- **Shopping Experience**: Cart management, checkout flow, order confirmation, and tracking.
- **User Accounts**: Customer profile management and wishlist functionality.

### 🏪 Vendor Workspace
- **Dashboard**: Dedicated vendor dashboard and "my shop" area.
- **Shop Management**: Tools for managing products, orders, staff, shipping, taxes, and more.
- **Onboarding**: Integrated vendor onboarding flow.

### 👑 Admin Console
- **Platform Oversight**: Admin dashboard for global metrics.
- **Tenant Management**: Manage tenants, users, and global settings.
- **Catalog Control**: Oversee global products, categories, brands, and reviews.

### 🛠️ Backend & Infrastructure
- **Auth System**: Secure authentication mounted at `/api/auth/*` using Better Auth.
- **Server Functions**: Type-safe backend logic using TanStack Start server functions.
- **Email**: OTP email delivery via Nodemailer (SMTP).

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed on your machine:

- [Bun](https://bun.sh/) (Recommended runtime)
- [Node.js](https://nodejs.org/) (v20+ for tooling)
- [PostgreSQL](https://www.postgresql.org/) (or a Neon database)

### Cloning the Repository

```bash
git clone https://github.com/FullStack-Flow/shop-stack.git
cd shop-stack
```

### Installation

Install the project dependencies using Bun:

```bash
bun install
```

### Set Up Environment Variables

Create a new file named `.env` in the root of your project and add the following content:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/db
BETTER_AUTH_SECRET=replace-with-strong-secret
VITE_BETTER_AUTH_URL=http://localhost:3000

NODE_ENV=development

# Production URL
BETTER_AUTH_URL=https://your-production-domain.com

# Social Auth (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# SMTP (Brevo Example)
BREVO_SMTP_SERVER=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_LOGIN=your-brevo-login
BREVO_SMTP_PASSWORD=your-brevo-password
```

### Database Setup

Run the following commands to generate migrations, push them to the database, and seed initial data:

```bash
bun run db:generate
bun run db:push
bun run db:seed
```

### Running the Project

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

## <a name="resources">🔗 Resources</a>

- **Live Demo**: [https://shop-stack-demo.vercel.app/](https://shop-stack-demo.vercel.app/)
- **Repository**: [https://github.com/FullStack-Flow/shop-stack](https://github.com/FullStack-Flow/shop-stack)
- **Video Walkthrough**: [https://youtu.be/KRZF4VxqETU](https://youtu.be/KRZF4VxqETU)

## <a name="deployment">🚀 Deployment</a>

The `start` script runs `server.ts`, a Bun-based production server that serves the built TanStack Start output.

1. Set all required environment variables in your hosting platform.
2. Build the application:
   ```bash
   bun run build
   ```
3. Run the production server:
   ```bash
   bun run start
   ```

## <a name="contributing">🤝 Contributing</a>

1. Fork the repository and create a feature branch.
2. Run `bun install` and ensure tests and linting pass.
3. Keep UI changes aligned with existing Tailwind and shadcn patterns.
4. Submit a pull request with a clear summary and screenshots.
