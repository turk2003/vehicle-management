# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js App Router vehicle management system. Route pages live in `app/**/page.tsx`, API handlers in `app/api/**/route.ts`, and shared UI in `app/component/`. Shared server utilities are in `lib/`, including auth, Prisma access, permissions, API helpers, and test mocks in `lib/__mocks__/`. Database schema, migrations, and seed scripts are in `prisma/`. Static assets are in `public/`. API tests are colocated beside routes, for example `app/api/booking/__tests__/route.test.ts`.

## Build, Test, and Development Commands
- `npm run dev`: start the Next.js development server at `http://localhost:3000`.
- `npm run build`: create a production build and catch Next.js or TypeScript issues.
- `npm run start`: run the production server after building.
- `npm run lint`: run ESLint with Next.js core-web-vitals and TypeScript rules.
- `npm test`: run the Vitest suite once.
- `npm run test:watch`: run Vitest in watch mode while editing tests.
- `docker compose up -d`: start the local PostgreSQL 15 database defined in `docker-compose.yml`.
- `npx prisma migrate dev`: apply local schema migrations.
- `npx prisma db seed`: seed development data using `prisma/seed.ts`.

## Coding Style & Naming Conventions
Use TypeScript, React function components, and existing App Router conventions. Prefer the `@/` alias for root imports when it improves readability. Keep API handlers thin and move reusable behavior into `lib/`. Use camelCase for variables and functions, PascalCase for React components and exported types, and route-segment names for folders. Follow the current two-space indentation style in TS/TSX files and run `npm run lint` before handoff.

## Testing Guidelines
Vitest runs in a Node environment with globals enabled. Add tests near the changed route or module inside `__tests__/` and name files `*.test.ts`. Mock Prisma through `lib/__mocks__/prisma.ts` for API handler tests. Cover successful paths, validation failures, authorization checks, and database errors. Run `npm test` before opening a PR.

## Commit & Pull Request Guidelines
Recent history uses short imperative summaries such as `add test` and occasional Conventional Commit style like `feat: Enable editing...`. Prefer concise imperative messages; use `feat:`, `fix:`, or `refactor:` when the type is clear. PRs should include a description, test results, linked issue or task, migration notes when `prisma/` changes, and screenshots for visible UI updates.

## Security & Configuration Tips
Keep secrets in `.env` and never commit credentials. `DATABASE_URL` is required by Prisma through `prisma.config.ts`. The Docker database uses local defaults only; use environment-specific credentials outside development.
