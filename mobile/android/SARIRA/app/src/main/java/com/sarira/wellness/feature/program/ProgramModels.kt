package com.sarira.wellness.feature.program

import com.sarira.wellness.domain.model.WellnessProgram

enum class ProgramGoalOption(
    val title: String,
    val description: String,
    val emoji: String,
    val programName: String,
    val durationDays: Int,
    val focus: String,
    val habits: List<String>,
) {
    LOSE_WEIGHT(
        title = "Menurunkan berat badan",
        description = "Membangun defisit yang realistis tanpa pola ekstrem.",
        emoji = "⚖️",
        programName = "Program Langkah Ringan 28 Hari",
        durationDays = 28,
        focus = "Pola makan sadar dan aktivitas yang konsisten",
        habits = listOf("Piring makan seimbang", "Jalan kaki harian", "Cek rasa lapar"),
    ),
    GAIN_WEIGHT(
        title = "Menambah berat badan",
        description = "Menambah energi dan kekuatan secara bertahap.",
        emoji = "💪",
        programName = "Program Tumbuh Kuat 28 Hari",
        durationDays = 28,
        focus = "Asupan bernutrisi dan latihan kekuatan dasar",
        habits = listOf("Jadwal makan teratur", "Protein di tiap makan", "Latihan kekuatan"),
    ),
    STAY_HEALTHY(
        title = "Menjaga kesehatan",
        description = "Merawat ritme sehat yang mudah dipertahankan.",
        emoji = "🌿",
        programName = "Program Ritme Sehat 21 Hari",
        durationDays = 21,
        focus = "Keseimbangan nutrisi, gerak, dan pemulihan",
        habits = listOf("Minum air cukup", "Gerak 30 menit", "Tidur tepat waktu"),
    ),
    IMPROVE_FITNESS(
        title = "Meningkatkan kebugaran",
        description = "Menaikkan stamina dan kemampuan gerak tubuh.",
        emoji = "🏃",
        programName = "Program Bugar Bertahap 28 Hari",
        durationDays = 28,
        focus = "Stamina, mobilitas, dan pemulihan aktif",
        habits = listOf("Latihan terjadwal", "Mobility reset", "Hari pemulihan aktif"),
    ),
}

enum class DailyActivityOption(
    val title: String,
    val description: String,
) {
    LOW("Lebih banyak duduk", "Aktivitas ringan dan jarang berolahraga"),
    LIGHT("Sedikit aktif", "Banyak berjalan atau olahraga 1–2 kali per minggu"),
    MODERATE("Cukup aktif", "Olahraga atau aktivitas fisik 3–4 kali per minggu"),
    HIGH("Sangat aktif", "Aktivitas fisik intens hampir setiap hari"),
}

data class ProgramQuestionnaire(
    val age: Int = 28,
    val heightCm: String = "170",
    val weightKg: String = "65",
    val dailyActivity: DailyActivityOption = DailyActivityOption.MODERATE,
)

fun ProgramGoalOption.toWellnessProgram(): WellnessProgram = WellnessProgram(
    name = programName,
    durationDays = durationDays,
    focus = focus,
    mainHabits = habits,
    goal = title,
)
