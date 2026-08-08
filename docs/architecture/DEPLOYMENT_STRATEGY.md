# Deployment Strategy

## Selected staging topology

- User web: Vercel static Expo Web output.
- Admin: Vercel Next.js runtime.
- API: Render Docker web service.
- Database/Auth/Storage: a dedicated Supabase staging project.

This is operationally simple, supports free/low-cost evaluation, and avoids production release. Provider manifests are `apps/*/vercel.json`, `render.yaml`, API Dockerfile, Prisma migration, and Supabase storage SQL.

## Manual sequence

1. Create a dedicated Supabase staging project and choose region after privacy review.
2. Add `vector` extension support and apply Prisma migration using staging `DIRECT_URL`.
3. Apply reviewed storage-bucket SQL; verify RLS with two-user negative tests.
4. Configure Render server-only environment and deploy API.
5. Verify `/api/v1/health` and `/version`.
6. Configure Vercel public variables and API URL for user/admin projects.
7. Deploy user/admin previews and run auth/responsive smoke tests.
8. Record URLs and commit SHA in the Phase 2 report.

`.github/workflows/deploy-staging.yml` is manual and uses GitHub Environment secrets plus provider deploy hooks. Production deployment is not defined.

## Current status

All manifests and builds are ready. No external staging project credentials or deploy hooks were available in this workspace, so no honest staging URL can be reported. Local API/database smoke tests are complete; external deployment remains the only blocking acceptance item.
