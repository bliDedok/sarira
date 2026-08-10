package com.sarira.wellness.core.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.sarira.wellness.feature.home.HomeRoute
import com.sarira.wellness.feature.placeholder.SectionPlaceholderRoute
import com.sarira.wellness.feature.program.ProgramGoalOption
import com.sarira.wellness.feature.program.ProgramGoalRoute
import com.sarira.wellness.feature.program.ProgramQuestionnaire
import com.sarira.wellness.feature.program.ProgramQuestionnaireRoute
import com.sarira.wellness.feature.program.ProgramSummaryRoute
import com.sarira.wellness.feature.program.toWellnessProgram
import com.sarira.wellness.feature.splash.SplashRoute
import com.sarira.wellness.feature.welcome.WelcomeRoute

@Composable
internal fun SariraNavHost(
    navController: NavHostController,
    modifier: Modifier = Modifier,
) {
    var selectedGoal by remember { mutableStateOf<ProgramGoalOption?>(null) }
    var questionnaire by remember { mutableStateOf(ProgramQuestionnaire()) }
    var personalProgram by remember { mutableStateOf<com.sarira.wellness.domain.model.WellnessProgram?>(null) }

    NavHost(
        navController = navController,
        startDestination = SariraDestination.Splash.route,
        modifier = modifier,
    ) {
        composable(route = SariraDestination.Splash.route) {
            SplashRoute(
                onReady = {
                    navController.navigate(SariraDestination.Welcome.route) {
                        popUpTo(SariraDestination.Splash.route) {
                            inclusive = true
                        }
                        launchSingleTop = true
                    }
                },
            )
        }
        composable(route = SariraDestination.Welcome.route) {
            WelcomeRoute(
                onStart = {
                    selectedGoal = null
                    questionnaire = ProgramQuestionnaire()
                    navController.navigate(SariraDestination.ProgramGoal.route)
                },
                onExplore = {
                    navController.navigate(SariraDestination.Home.route) {
                        popUpTo(SariraDestination.Welcome.route) {
                            inclusive = true
                        }
                        launchSingleTop = true
                    }
                },
            )
        }
        composable(route = SariraDestination.ProgramGoal.route) {
            ProgramGoalRoute(
                selectedGoal = selectedGoal,
                onGoalSelected = { selectedGoal = it },
                onContinue = {
                    if (selectedGoal != null) {
                        navController.navigate(SariraDestination.ProgramQuestionnaire.route)
                    }
                },
                onBack = { navController.popBackStack() },
            )
        }
        composable(route = SariraDestination.ProgramQuestionnaire.route) {
            ProgramQuestionnaireRoute(
                questionnaire = questionnaire,
                onQuestionnaireChanged = { questionnaire = it },
                onContinue = {
                    if (selectedGoal != null) {
                        navController.navigate(SariraDestination.ProgramSummary.route)
                    }
                },
                onBack = { navController.popBackStack() },
            )
        }
        composable(route = SariraDestination.ProgramSummary.route) {
            val program = selectedGoal?.toWellnessProgram()
            if (program != null) {
                ProgramSummaryRoute(
                    program = program,
                    questionnaire = questionnaire,
                    onFinish = {
                        personalProgram = program
                        val removedGuestHome = navController.popBackStack(
                            route = SariraDestination.Home.route,
                            inclusive = true,
                        )
                        if (!removedGuestHome) {
                            navController.popBackStack(
                                route = SariraDestination.Welcome.route,
                                inclusive = true,
                            )
                        }
                        navController.navigate(SariraDestination.Home.route) {
                            launchSingleTop = true
                        }
                    },
                    onBack = { navController.popBackStack() },
                )
            }
        }
        composable(route = SariraDestination.Home.route) {
            HomeRoute(
                program = personalProgram,
                onCreateProgram = {
                    selectedGoal = null
                    questionnaire = ProgramQuestionnaire()
                    navController.navigate(SariraDestination.ProgramGoal.route)
                },
            )
        }
        composable(route = SariraDestination.Food.route) {
            SectionPlaceholderRoute(titleRes = com.sarira.wellness.R.string.navigation_food)
        }
        composable(route = SariraDestination.Activity.route) {
            SectionPlaceholderRoute(titleRes = com.sarira.wellness.R.string.navigation_activity)
        }
        composable(route = SariraDestination.Progress.route) {
            SectionPlaceholderRoute(titleRes = com.sarira.wellness.R.string.navigation_progress)
        }
        composable(route = SariraDestination.Profile.route) {
            SectionPlaceholderRoute(titleRes = com.sarira.wellness.R.string.navigation_profile)
        }
    }
}
