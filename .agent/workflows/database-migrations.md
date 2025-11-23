---
description: How to manage database migrations with Drizzle Kit
---

# Database Migrations

This project uses [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) for database migrations, which is similar to Laravel migrations but declarative.

## Workflow

1.  **Modify Schema**: Edit `lib/db.ts` to change your database schema (e.g., add tables, columns).
2.  **Generate Migration**: Run `pnpm db:generate`. This creates a SQL migration file in the `drizzle` folder based on your changes.
3.  **Apply Migration**: Run `pnpm db:migrate` to apply the changes to your database.

## Commands

-   `pnpm db:generate`: Generates SQL migration files based on schema changes.
-   `pnpm db:migrate`: Applies pending migrations to the database.
-   `pnpm db:push`: Pushes schema changes directly to the database (useful for prototyping, skips migration files).
-   `pnpm db:studio`: Opens Drizzle Studio to view and manage your data in the browser.

## Example: Adding a new table

1.  Add the table definition to `lib/db.ts`:

    ```typescript
    export const categories = pgTable('categories', {
      id: serial('id').primaryKey(),
      name: text('name').notNull(),
    });
    ```

2.  Run `pnpm db:generate`. You will see a new file in `drizzle/0000_...sql`.
3.  Run `pnpm db:migrate` to create the table in Supabase.
