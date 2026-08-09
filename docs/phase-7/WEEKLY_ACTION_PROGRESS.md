# Weekly Action Progress

Assignment menyimpan week start/end, target, progress, status, reason codes, alternatives, selection version, why, dan timestamps. UI menampilkan tepat satu current action, 7 local dates, progress yang accessible, reasons, safety notice, serta history.

Manual completion membuat `WeeklyActionCheckIn` dengan source `USER_CONFIRMED`; unique `(assignmentId, localDate)` membuat retry idempotent. Delete pada tanggal yang sama melakukan undo. Progress dihitung dari jumlah check-in dan status berubah menjadi completed ketika target tercapai.

Schema menyiapkan `AUTO_VERIFIED`, tetapi Phase 7 tidak mengimplementasikan automation. Jika dipakai pada fase mendatang, `evidenceRef` wajib menghubungkan verifikasi ke record sumber. History tetap tersedia setelah assignment diganti atau selesai.
