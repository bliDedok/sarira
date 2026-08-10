package com.sarira.wellness.feature.program

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ProgramModelsTest {
    @Test
    fun everyGoal_createsCompleteWellnessProgram() {
        ProgramGoalOption.entries.forEach { goal ->
            val program = goal.toWellnessProgram()

            assertEquals(goal.programName, program.name)
            assertEquals(goal.durationDays, program.durationDays)
            assertEquals(goal.title, program.goal)
            assertTrue(program.focus.isNotBlank())
            assertEquals(3, program.mainHabits.size)
        }
    }

    @Test
    fun questionnaire_defaultsAreWithinSupportedRanges() {
        val questionnaire = ProgramQuestionnaire()

        assertTrue(questionnaire.age in 15..80)
        assertTrue(questionnaire.heightCm.toInt() in 100..230)
        assertTrue(questionnaire.weightKg.toInt() in 30..250)
    }
}
