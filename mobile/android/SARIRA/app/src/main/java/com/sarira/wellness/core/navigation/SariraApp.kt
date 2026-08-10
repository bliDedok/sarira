package com.sarira.wellness.core.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController

@Composable
fun SariraApp() {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val showBottomNavigation = sariraTopLevelDestinations.any {
        it.destination.route == currentRoute
    }

    Scaffold(
        bottomBar = {
            if (showBottomNavigation) {
                SariraBottomNavigation(
                    currentRoute = currentRoute,
                    onDestinationSelected = { item ->
                        navController.navigate(item.destination.route) {
                            popUpTo(SariraDestination.Home.route) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                )
            }
        },
    ) { innerPadding ->
        SariraNavHost(
            navController = navController,
            modifier = Modifier.padding(innerPadding),
        )
    }
}
