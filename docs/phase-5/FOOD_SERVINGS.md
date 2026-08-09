# Food Servings

## Food-specific conversion

A serving is owned by one `FoodItem`; labels such as “1 butir”, “1 potong”, or “1 gelas” are not global conversion rules. Each row carries an optional `gramEquivalent`, source, and verification flag.

Current units are `G`, `KG`, `ML`, `L`, `PIECE`, `SERVING`, `TBSP`, `TSP`, and `CUP`.

## Formula

```text
gramAmount = requestedQuantity × gramEquivalent
```

Example: one 55 g egg at quantity 2 becomes 110 g. A 150 g rice serving at quantity 1.25 becomes 187.5 g.

## Validation

- quantity must be finite and greater than zero;
- `gramEquivalent` must exist and be greater than zero;
- a serving must belong to the selected food;
- client and API validation reject invalid or excessively large portions.

Missing conversion data returns an explicit invalid-portion response. The application does not guess a density or household measure.

## Editing

Changing serving or quantity recalculates the food vector and replaces the item's snapshot. The following daily read immediately reflects the new value; no stale daily-total cache is retained.
