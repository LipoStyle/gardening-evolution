import { Pool } from "pg";

export const pool = new Pool({
  user: process.env.PGUSER!, // must be set in Vercel
  password: process.env.PGPASSWORD!,
  host: process.env.PGHOST!, // this must be your Supabase host
  port: Number(process.env.PGPORT!),
  database: process.env.PGDATABASE!,
});
