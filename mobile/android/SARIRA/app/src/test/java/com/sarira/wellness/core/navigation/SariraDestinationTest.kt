package com.sarira.wellness.core.navigation

import org.junit.Assert.assertEquals
import org.junit.Test

class SariraDestinationTest {
    @Test
    fun routes_areStableAndUnique() {
        val routes = listOf(
            SariraDestination.Splash.route,
            SariraDestination.Welcome.route,
            SariraDestination.ProgramGoal.route,
            SariraDestination.ProgramQuestionnaire.route,
            SariraDestination.ProgramSummary.route,
            SariraDestination.Home.route,
            SariraDestination.Food.route,
            SariraDestination.Activity.route,
            SariraDestination.Progress.route,
            SariraDestination.Profile.route,
        )

        assertEquals(10, routes.size)
        assertEquals(routes.size, routes.distinct().size)
        assertEquals("splash", routes.first())
        assertEquals("profile", routes.last())
    }
}
