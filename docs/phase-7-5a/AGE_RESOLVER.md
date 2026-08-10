# Authoritative Age Resolver

Resolver berada di `packages/expert-system/src/index.ts` dan diekspor sebagai `resolveAgeContext`.

## Input

```ts
interface AgeResolverInput {
  declaredAge?: number | null;
  ageRecordedAt?: string | null;
  dateOfBirth?: string | null;
}
```

## Output

```ts
interface AgeContext {
  age: number;
  ageGroup: AgeGroup;
  source: 'DECLARED' | 'LEGACY_DOB';
  recordedAt?: string;
  requiresReconfirmation: boolean;
}
```

## Priority dan policy

1. Jika `declaredAge` ada, validasi integer 12–75 dan pasangan timestamp.
2. Declared age selalu menang walaupun DOB legacy juga ada.
3. Declared age tidak di-increment otomatis.
4. Reconfirmation aktif setelah satu tahun tanpa mengubah age/age group.
5. Jika declared age tidak ada, hitung usia dari DOB legacy.
6. Jika keduanya tidak ada, resolver mengembalikan `null`.

## Boundary mapping

| Usia | Group |
| --- | --- |
| <12 | `UNDER_12` |
| 12–17 | `TEEN` |
| 18–25 | `YOUNG_ADULT` |
| 26–59 | `ADULT_BALANCE` |
| 60–75 | `HEALTHY_AGING` |
| >75 | `OVER_75` |

Input baru hanya mengizinkan 12–75. Boundary 12, 17, 18, 25, 26, 59, 60, dan 75 diuji deterministik.

## Integration consumers

Memory repository dan Prisma repository membentuk `UserProfile` melalui resolver yang sama. Onboarding completeness, safety route, goal eligibility, baseline, nutrition, feature/expert-system flow memakai effective age context, bukan kalkulasi DOB tersebar.

Compatibility alias lama seperti `classifyAge(dateOfBirth)` tetap tersedia untuk consumer legacy dan test lama.

## Guardian behavior

`requiresGuardianConsentForAge` memanggil klasifikasi yang sama. Usia 12–17 masuk guardian flow; usia 18 keluar dari flow tersebut.

## Error behavior

Resolver menolak declared age non-integer, di luar 12–75, timestamp hilang/tidak valid, atau timestamp di masa depan. Database constraint menjadi lapisan pertahanan kedua.
