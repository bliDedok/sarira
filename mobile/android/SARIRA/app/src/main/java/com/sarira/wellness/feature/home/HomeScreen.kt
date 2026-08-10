package com.sarira.wellness.feature.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.sarira.wellness.R
import com.sarira.wellness.domain.model.WellnessProgram

private data class DailyAction(
    val title: String,
    val detail: String,
    val emoji: String,
)

private val dailyActions = listOf(
    DailyAction("Minum air", "5 dari 8 gelas", "💧"),
    DailyAction("Langkah", "4.820 dari 7.000", "👟"),
    DailyAction("Tarik napas", "2 menit untuk jeda", "🌿"),
)

@Composable
fun HomeRoute(
    program: WellnessProgram?,
    onCreateProgram: () -> Unit,
) {
    HomeScreen(
        program = program,
        onCreateProgram = onCreateProgram,
    )
}

@Composable
private fun HomeScreen(
    program: WellnessProgram?,
    onCreateProgram: () -> Unit,
) {
    val listState = rememberLazyListState()

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background,
    ) {
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxSize(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(
                start = 20.dp,
                top = 18.dp,
                end = 20.dp,
                bottom = 28.dp,
            ),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            item {
                HomeHeader(isGuest = program == null)
            }
            item {
                if (program == null) {
                    GuestProgramCard(onCreateProgram = onCreateProgram)
                } else {
                    ProgramCard(
                        title = program.name,
                        subtitle = "Hari ke-1 · ${program.focus}",
                        progress = 0.04f,
                    )
                }
            }
            item {
                SectionTitle(
                    title = "Aksi hari ini",
                    action = "3 kebiasaan",
                )
            }
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(dailyActions) { action ->
                        DailyActionCard(
                            title = action.title,
                            detail = action.detail,
                            emoji = action.emoji,
                        )
                    }
                }
            }
            item {
                NutritionCard(
                    calories = 1_180,
                    calorieTarget = 1_850,
                    proteinProgress = 0.62f,
                    carbProgress = 0.58f,
                    fatProgress = 0.48f,
                )
            }
            item {
                SectionTitle(
                    title = "Rekomendasi makan",
                    action = "Untuk siang ini",
                )
            }
            item {
                MealRecommendationCard(
                    title = "Grain bowl ayam panggang",
                    detail = "Protein tinggi · Serat seimbang",
                    calories = "520 kkal",
                )
            }
            item {
                MotionCoachCard(
                    title = "Mobility reset",
                    detail = "Gerakan ringan untuk bahu dan punggung",
                    duration = "8 menit",
                )
            }
            item {
                RewardCard(
                    points = 240,
                    detail = "Pertahankan 3 hari lagi untuk membuka badge Ritme Seimbang.",
                )
            }
        }
    }
}

@Composable
private fun HomeHeader(isGuest: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = if (isGuest) {
                    stringResource(R.string.guest_home_greeting)
                } else {
                    stringResource(R.string.home_greeting)
                },
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = if (isGuest) {
                    stringResource(R.string.guest_home_summary)
                } else {
                    stringResource(R.string.home_summary)
                },
                modifier = Modifier.padding(top = 3.dp),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        IconButton(onClick = {}) {
            Icon(
                imageVector = Icons.Outlined.Notifications,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Surface(
            modifier = Modifier.size(44.dp),
            shape = MaterialTheme.shapes.large,
            color = MaterialTheme.colorScheme.primaryContainer,
        ) {
            Icon(
                imageVector = Icons.Outlined.Person,
                contentDescription = stringResource(R.string.profile_content_description),
                modifier = Modifier.padding(10.dp),
                tint = MaterialTheme.colorScheme.onPrimaryContainer,
            )
        }
    }
}

@Composable
private fun SectionTitle(
    title: String,
    action: String,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Bottom,
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = action,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.primary,
        )
    }
}
