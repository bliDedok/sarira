package com.sarira.wellness.core.navigation

import androidx.annotation.StringRes
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.DirectionsRun
import androidx.compose.material.icons.automirrored.outlined.DirectionsRun
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Insights
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Insights
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.ui.graphics.vector.ImageVector
import com.sarira.wellness.R

sealed interface SariraDestination {
    val route: String

    data object Splash : SariraDestination {
        override val route = "splash"
    }

    data object Welcome : SariraDestination {
        override val route = "welcome"
    }

    data object ProgramGoal : SariraDestination {
        override val route = "program_goal"
    }

    data object ProgramQuestionnaire : SariraDestination {
        override val route = "program_questionnaire"
    }

    data object ProgramSummary : SariraDestination {
        override val route = "program_summary"
    }

    data object Home : SariraDestination {
        override val route = "home"
    }

    data object Food : SariraDestination {
        override val route = "food"
    }

    data object Activity : SariraDestination {
        override val route = "activity"
    }

    data object Progress : SariraDestination {
        override val route = "progress"
    }

    data object Profile : SariraDestination {
        override val route = "profile"
    }
}

data class SariraTopLevelDestination(
    val destination: SariraDestination,
    @param:StringRes val labelRes: Int,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
)

val sariraTopLevelDestinations = listOf(
    SariraTopLevelDestination(
        destination = SariraDestination.Home,
        labelRes = R.string.navigation_home,
        selectedIcon = Icons.Filled.Home,
        unselectedIcon = Icons.Outlined.Home,
    ),
    SariraTopLevelDestination(
        destination = SariraDestination.Food,
        labelRes = R.string.navigation_food,
        selectedIcon = Icons.Filled.Restaurant,
        unselectedIcon = Icons.Outlined.Restaurant,
    ),
    SariraTopLevelDestination(
        destination = SariraDestination.Activity,
        labelRes = R.string.navigation_activity,
        selectedIcon = Icons.AutoMirrored.Filled.DirectionsRun,
        unselectedIcon = Icons.AutoMirrored.Outlined.DirectionsRun,
    ),
    SariraTopLevelDestination(
        destination = SariraDestination.Progress,
        labelRes = R.string.navigation_progress,
        selectedIcon = Icons.Filled.Insights,
        unselectedIcon = Icons.Outlined.Insights,
    ),
    SariraTopLevelDestination(
        destination = SariraDestination.Profile,
        labelRes = R.string.navigation_profile,
        selectedIcon = Icons.Filled.Person,
        unselectedIcon = Icons.Outlined.Person,
    ),
)
