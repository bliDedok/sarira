# Structured Mobile Inputs

## Component mapping

| Component | Domain | Range/step | Interaction |
| --- | --- | --- | --- |
| `AgePicker` | usia | 12–75, step 1 | Stepper + numeric input alternative. |
| `WeightPicker` | berat | 20–300 kg, step 0.5 | Stepper + decimal keyboard. |
| `HeightPicker` | tinggi | 80–250 cm, step 1 | Stepper + numeric keyboard. |
| `TimePicker` | tidur/bangun | 00:00–23:59 | Hour/minute steppers; rollover hari benar. |
| `SelectionCard` | single select | satu pilihan | Radio semantics, indicator/checkmark. |
| `MultiSelectionCard` | multi select | banyak pilihan | Checkbox semantics, indicator/checkmark. |

## Numeric picker behavior

- Unit selalu terlihat.
- Tombol kurang/tambah minimal 52 px.
- Nilai dikunci ke range domain.
- Decimal comma dinormalisasi untuk berat.
- Invalid draft kembali ke nilai terakhir saat commit.
- Tombol boundary disabled dan diumumkan ke accessibility tree.
- Web/desktop tetap mempunyai text alternative; mobile menerima numeric/decimal keyboard.

## Time picker behavior

Pengguna tidak perlu mengetik `23:00` menggunakan keyboard QWERTY. Jam dan menit mempunyai tombol terpisah. Perubahan menit membawa/ meminjam jam dengan benar, misalnya 23:00 dikurangi 5 menit menjadi 22:55 dan 23:00 ditambah satu jam menjadi 00:00.

Fondasi ini merupakan accessible equivalent lintas platform. Penggantian dengan modal native khusus OS dapat dilakukan kemudian tanpa mengubah contract `value: HH:mm`.

## Selection states

`SelectionCard` mendukung default, pressed, selected, disabled, web focus, dan error. Selected state memakai border serta checkmark; makna tidak bergantung warna saja.

## Onboarding mapping

- Role, safety answer, goal, program preference: `SelectionCard`.
- Multi-select questionnaire: `MultiSelectionCard`.
- Weight/height question: picker terstruktur.
- Sleep/wake time: `TimePicker`.
- Generic field hanya dipakai ketika domain memang membutuhkan teks bebas.

Formula Nutrition Engine tidak diubah.
