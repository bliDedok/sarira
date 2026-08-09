# Data Completeness

Data Completeness Engine menilai ketersediaan data baseline; ia bukan expert system, health score, atau confidence diagnosis.

## Konfigurasi development

Versi `phase4-dev-v1`, status `REQUIRES_PRODUCT_EXPERT_VALIDATION`:

| Domain inti | Bobot | Minimum harian | Wajib readiness |
|---|---:|---:|---|
| Check-in | 25% | 1 | Ya |
| Food | 25% | 1 | Ya |
| Sleep | 25% | 1 | Ya |
| Activity | 25% | 1 | Ya |

Steps, body measurement, dan digestive log adalah data optional dan tidak menaikkan score Phase 4.

## Daily completeness

Setiap domain yang mencapai minimum memberi bobotnya. Empat domain adalah `COMPLETE` (100), satu sampai tiga adalah `PARTIAL`, dan nol adalah `MISSING`. UI menggunakan kalimat “N dari 4 kategori tercatat”; tidak memakai bahasa gagal, buruk, atau tidak disiplin.

## Overall completeness

Denominator adalah jumlah hari kalender yang sudah berlalu, dibatasi 14 hari untuk readiness inti. Missing day otomatis masuk denominator dengan nol coverage; timeline tidak bergeser. Coverage domain = jumlah hari domain tersedia dibagi elapsed days. Overall score adalah jumlah coverage × bobot.

Snapshot disimpan sebagai `DataCompletenessSnapshot` dengan scope, score, status, coverage, missing domains, completed/elapsed days, config version, dan calculated time. Kalkulasi dipicu setelah write/delete domain inti dan saat baseline dibaca.

## Readiness development

READY memerlukan score minimal 75 dan setiap domain wajib memiliki coverage minimal 60%. PARTIALLY_READY mulai score 55 bila READY tidak terpenuhi; sisanya INSUFFICIENT_DATA. Nilai ini bukan clinical threshold dan harus divalidasi product/expert/usability sebelum production activation.
