# Staging deployment

Use the manual `deploy-staging.yml` workflow only after GitHub Environment `staging` contains separate Supabase URLs, database URLs, and provider deploy hooks. Verify API and migrations before triggering web deployments. Production auto-deploy is intentionally absent.
