package com.sarira.wellness.core.navigation

import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource

@Composable
internal fun SariraBottomNavigation(
    currentRoute: String?,
    onDestinationSelected: (SariraTopLevelDestination) -> Unit,
) {
    NavigationBar {
        sariraTopLevelDestinations.forEach { item ->
            val selected = currentRoute == item.destination.route
            NavigationBarItem(
                selected = selected,
                onClick = { onDestinationSelected(item) },
                icon = {
                    Icon(
                        imageVector = if (selected) item.selectedIcon else item.unselectedIcon,
                        contentDescription = null,
                    )
                },
                label = {
                    Text(
                        text = stringResource(item.labelRes),
                        style = MaterialTheme.typography.labelSmall,
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                ),
            )
        }
    }
}
