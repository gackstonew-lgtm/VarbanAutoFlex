# Varban Auto Flex — Digital Automotive Marketplace & Car Yard Platform (Kenya)

> **Tagline:** "Find it. Buy it. Drive it."  
> **Supporting message:** "Kenya's smarter way to buy and sell quality vehicles."

Varban Auto Flex is a production-ready, fintech-grade Kenyan automotive marketplace and digital car-yard platform inspired by UnitPay visual design principles. It features real-time search & filter query synchronization, instant vehicle submission with logbook protection under Supabase RLS, configurable Safaricom Daraja M-Pesa / PayHero payment provider architecture, Resend transactional emails, and Vercel serverless deployment.

---

## WINDOWS CMD SETUP

Follow these exact steps to set up and run the platform locally on Windows:

1. Open Command Prompt.

2. Navigate to the project directory:

```cmd
cd path\to\project
```

Example:

```cmd
cd C:\Projects\yardly
```

3. Install dependencies:

```cmd
npm install
```

4. Create the environment file:

```cmd
copy .env.example .env
```

5. Add the required Supabase, payment and email environment variables to .env.

6. Start the development server:

```cmd
npm run dev
```

7. Open:

http://localhost:5173/

---

## LOCAL DEVELOPMENT & HOSTING

- The project uses standard Node.js and Vite for local development.
- Do **NOT** require XAMPP, Apache, PHP, Laragon, Node HTTP servers, or any external web servers.
- Runs seamlessly across **Windows CMD**, **PowerShell**, and **VS Code Integrated Terminal**.
- All API endpoints are invoked relative to the application origin (`/api/...`).
- Network sharing is enabled by default via `host: true` and `port: 5173` in `vite.config.ts`.

---

## LOCAL WEBHOOK DEVELOPMENT

During local development (`npm run dev`), external payment gateways (Safaricom Daraja / PayHero) cannot directly reach `http://localhost:5173/api/...`.

To test real external webhooks on your local machine:

1. Use a secure tunnel provider like **ngrok** or **Cloudflare Tunnel**:
   ```cmd
   ngrok http 5173
   ```
2. Copy the generated HTTPS forwarding URL (e.g. `https://xxxx.ngrok-free.app`).
3. Set your payment provider callback URL environment variable:
   ```ini
   MPESA_CALLBACK_URL=https://xxxx.ngrok-free.app/api/payments/callback
   ```
4. For standard local browsing, UI development, and payment sandbox testing (`PAYMENT_MODE=test`), no tunnel is required. Simply run `npm run dev` and open `http://localhost:5173/`.

---

## ENVIRONMENT & SECRET SECURITY

To prevent secret leakage:
- Client-side environment variables exposed to Vite browser code MUST be prefixed with `VITE_` (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Secret backend credentials (`SUPABASE_SERVICE_ROLE_KEY`, `MPESA_CONSUMER_SECRET`, `PAYHERO_SECRET`, `RESEND_API_KEY`) must **NEVER** be prefixed with `VITE_` and are strictly accessible server-side in Vercel Serverless Functions.

---

## BUILD & TESTING COMMANDS

To run ESLint code analysis:
```cmd
npm run lint
```

To run TypeScript verification and production build compilation:
```cmd
npm run build
```

To preview the production build locally:
```cmd
npm run preview
```

---

## Database & Supabase Migration Setup

1. Create a new PostgreSQL project on [Supabase](https://app.supabase.com).
2. Execute the migration SQL script in the SQL Editor:
   - `supabase/migrations/20260901000000_initial_schema.sql`
3. Execute the seed script:
   - `supabase/seed.sql`
4. Set up Supabase Storage Buckets:
   - `vehicle-images` (Public)
   - `seller-documents` (Private, RLS protected)

---

## Vercel Deployment Instructions

1. Deploy using Vercel CLI or connect your GitHub repository:
   ```cmd
   vercel --prod
   ```
2. Configure project environment variables in the Vercel dashboard as specified in `.env.example`.

---

## License

Copyright &copy; 2026 Varban Auto Flex Technologies Ltd. All rights reserved.
