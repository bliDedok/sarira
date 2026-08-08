# Error Codes

| Code | HTTP | Meaning |
|---|---:|---|
| `VALIDATION_ERROR` | 400 | Body/params failed authoritative validation |
| `AUTHENTICATION_REQUIRED` | 401 | Missing, invalid, or expired user token |
| `INVALID_CREDENTIALS` | 401 | Login credentials rejected; reserved for client mapping |
| `AUTHORIZATION_DENIED` | 403 | Identity exists but role/ownership is insufficient |
| `NOT_FOUND` | 404 | Resource does not exist or is not visible to caller |
| `CONFLICT` | 409 | Unique/state conflict, including duplicate account intent |
| `RATE_LIMITED` | 429 | Request limit exceeded |
| `SERVICE_UNAVAILABLE` | 503 | Required upstream unavailable; reserved adapter code |
| `INTERNAL_ERROR` | 500 | Safe generic response; details stay in protected logs |

Clients switch on `code`, not message text. Never expose Prisma error, stack trace, SQL, secret, token, or sensitive payload in the response.
