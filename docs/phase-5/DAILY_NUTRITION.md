# Daily Nutrition

## Local-day boundary

Daily nutrition is keyed by the ISO `localDate` used by the active baseline and the profile timezone. The server never derives a nutrition day from browser timezone alone. The response includes both local date and timezone.

## Aggregation

The service loads all saved item snapshots for `profileId + localDate`, aggregates each of the eight nutrient codes, rounds once for output, and calculates indicator state against the effective target.

Returned metadata includes item and meal counts, missing nutrients, complete state, source versions, target snapshot, indicator records, calculation time, and item snapshots.

## Empty and incomplete days

An empty day has unavailable nutrient values rather than zero consumption. If any item is incomplete for a nutrient, that daily nutrient stays unavailable. UI text uses “Data belum tersedia”.

## History

`GET /nutrition/history?from=YYYY-MM-DD&to=YYYY-MM-DD` returns up to 31 local dates. The user app renders a 7-day view without causal interpretation or diagnosis.

## Cache/invalidation strategy

Phase 5 does not keep a server-side cache for mutable daily totals or history. They are recomputed from bounded snapshot queries after every read, so add/edit/delete is immediately visible. Food master data is stable and can receive version-keyed caching later; such caching must use source/version keys and must not include daily totals.

The Prisma repository fetches item snapshots in one bounded query, avoiding per-item nutrient lookups during daily aggregation.

