package com.sarira.wellness.domain.model

data class WellnessProgram(
    val name: String,
    val durationDays: Int,
    val focus: String,
    val mainHabits: List<String>,
    val goal: String,
)
