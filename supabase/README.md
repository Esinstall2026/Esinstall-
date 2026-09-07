# ES INSTALL — Supabase foundation

This directory contains the V14 database/storage foundation for the central backend.

## Migration

Apply `migrations/001_es_install_core.sql` to a Supabase project.

It creates:
- `jobs`
- `installations`
- `warranties`
- `evidence`
- private Storage bucket `es-install-evidence`
- authenticated-user RLS policies

## Production gate

This migration is **not the same as a live backend**. Before calling ES INSTALL production-ready, the project must be connected to the application with:

1. Supabase project URL
2. browser-safe anon/publishable key
3. real Supabase Auth users/roles
4. team-level authorization policies
5. evidence upload/download wired to Storage
6. migration applied and smoke-tested
7. frontend API adapter switched to the live service

Never put a Supabase service-role key in the Vite frontend or commit secrets to GitHub.
