# API Conventions

Base path: `/api/v1`. JSON is UTF-8. Request bodies and path parameters are validated with Zod. Server validation is authoritative.

## Success

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

## Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data tidak valid.",
    "details": []
  }
}
```

Use `Authorization: Bearer <Supabase access token>` for protected endpoints. Never send a Supabase public/secret API key as a Bearer user token. `x-request-id` may be supplied by trusted gateways; Fastify generates one otherwise.

Dates use ISO 8601; date of birth uses `YYYY-MM-DD`. IDs are UUID. Pagination metadata will be added when collection endpoints require it. Error messages are user-safe; logs contain machine context but redact sensitive fields.

Backward-compatible additions may ship inside v1. Breaking request/response semantics require a new API version. Health/clinical recommendation endpoints do not exist in Phase 2.
