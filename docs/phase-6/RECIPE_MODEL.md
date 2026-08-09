# Recipe Model

`Recipe` menyimpan identity/provenance dan ownership. `RecipeVersion` menyimpan porsi, waktu, difficulty, estimated cost category, cooking method, meal types, dietary tags, equipment, validation status, ingredients, steps, dan snapshot.

`RecipeIngredient` menunjuk `FoodItem` dan optional `FoodServing`; custom ingredient memakai `customName` dan optional user nutrition. Field quantity, gram amount, preparation note, optional flag, replacement group, serta order index tersedia. `RecipeStep` menyimpan urutan, instruction, dan timer foundation.

Curated/development recipe bersifat public. `USER_CREATED` selalu memiliki `ownerProfileId` dan `private=true`.
