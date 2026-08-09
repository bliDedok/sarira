# Phase 6 API Endpoints

Semua endpoint berada di `/api/v1`, memerlukan authentication dan `NUTRITION_DATA` consent.

## Recipes

- `GET /recipes`, `GET /recipes/:id`, `GET /recipes/:id/nutrition`
- `GET|POST /profiles/me/recipes`
- `GET|PATCH /profiles/me/recipes/:id`
- `POST /profiles/me/recipes/:id/duplicate`
- `POST /profiles/me/recipes/:id/archive`

## Guided Meal

- `GET /meal-plans/current?localDate=`
- `POST /meal-plans/generate`
- `GET /meal-plans/:id`
- `GET /meal-plans/:id/items/:itemId/alternatives`
- `POST /meal-plans/:id/items/:itemId/replace`
- `POST /meal-plans/:id/items/:itemId/cooking`
- `POST /meal-plans/:id/items/:itemId/consume`

## Flex Kitchen

- `POST /flex-kitchen/preview`
- `POST /flex-kitchen/consume`
- `POST /flex-kitchen/substitutions`
- `POST /flex-kitchen/save`

Errors mengikuti envelope existing. Ownership mismatch private resource memakai 404; revoked consent memakai `CONSENT_REQUIRED`; invalid/consumed replacement memakai conflict.
