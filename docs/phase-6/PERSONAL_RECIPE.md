# Personal Recipe

Personal recipe memakai model Recipe dengan `sourceType=USER_CREATED`, `ownerProfileId`, dan `private=true`. Pengguna dapat create, open, edit/version, duplicate, dan archive. Permanent delete tidak diekspos.

Save menyimpan ingredient references/snapshots, servings, method, steps, nutrition snapshot, dan source versions. Edit membuat version baru sehingga consumption history stabil. Endpoint selalu menyaring ownership; User B menerima 404 untuk private recipe User A.

Personal recipe tidak otomatis masuk curated candidate public.
