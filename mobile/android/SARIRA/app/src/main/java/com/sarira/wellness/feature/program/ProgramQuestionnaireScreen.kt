package com.sarira.wellness.feature.program

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp

@Composable
fun ProgramQuestionnaireRoute(
    questionnaire: ProgramQuestionnaire,
    onQuestionnaireChanged: (ProgramQuestionnaire) -> Unit,
    onContinue: () -> Unit,
    onBack: () -> Unit,
) {
    val isValid = questionnaire.heightCm.toIntOrNull() in 100..230 &&
        questionnaire.weightKg.toIntOrNull() in 30..250

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background,
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 14.dp),
                verticalArrangement = Arrangement.spacedBy(18.dp),
            ) {
                item {
                    ProgramHeader(
                        step = "LANGKAH 2 DARI 3",
                        title = "Kenali ritmemu",
                        description = "Informasi sederhana ini membantu kami menyiapkan contoh program yang lebih relevan.",
                        onBack = onBack,
                    )
                }
                item {
                    AgePicker(
                        age = questionnaire.age,
                        onAgeChanged = { age ->
                            onQuestionnaireChanged(questionnaire.copy(age = age))
                        },
                    )
                }
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        MeasurementField(
                            label = "Tinggi badan",
                            value = questionnaire.heightCm,
                            suffix = "cm",
                            onValueChange = { value ->
                                onQuestionnaireChanged(
                                    questionnaire.copy(heightCm = value.onlyDigits(3)),
                                )
                            },
                            modifier = Modifier.weight(1f),
                        )
                        MeasurementField(
                            label = "Berat badan",
                            value = questionnaire.weightKg,
                            suffix = "kg",
                            onValueChange = { value ->
                                onQuestionnaireChanged(
                                    questionnaire.copy(weightKg = value.onlyDigits(3)),
                                )
                            },
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
                item {
                    Text(
                        text = "Aktivitas harian",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                    )
                }
                items(DailyActivityOption.entries) { activity ->
                    ActivityCard(
                        activity = activity,
                        selected = activity == questionnaire.dailyActivity,
                        onClick = {
                            onQuestionnaireChanged(questionnaire.copy(dailyActivity = activity))
                        },
                    )
                }
            }
            Button(
                onClick = onContinue,
                enabled = isValid,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 20.dp, top = 10.dp, end = 20.dp, bottom = 18.dp)
                    .height(54.dp),
                shape = RoundedCornerShape(16.dp),
            ) {
                Text("Lihat program saya")
            }
        }
    }
}

@Composable
private fun AgePicker(
    age: Int,
    onAgeChanged: (Int) -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = "Umur",
                modifier = Modifier.fillMaxWidth(),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 14.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                AgeButton(
                    icon = Icons.Filled.Remove,
                    contentDescription = "Kurangi umur",
                    enabled = age > 15,
                    onClick = { onAgeChanged(age - 1) },
                )
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = age.toString(),
                        style = MaterialTheme.typography.displaySmall,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text = "tahun",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                AgeButton(
                    icon = Icons.Filled.Add,
                    contentDescription = "Tambah umur",
                    enabled = age < 80,
                    onClick = { onAgeChanged(age + 1) },
                )
            }
        }
    }
}

@Composable
private fun AgeButton(
    icon: ImageVector,
    contentDescription: String,
    enabled: Boolean,
    onClick: () -> Unit,
) {
    Surface(
        modifier = Modifier.size(48.dp),
        shape = CircleShape,
        color = MaterialTheme.colorScheme.primaryContainer,
    ) {
        IconButton(
            onClick = onClick,
            enabled = enabled,
            modifier = Modifier.size(48.dp),
        ) {
            Icon(imageVector = icon, contentDescription = contentDescription)
        }
    }
}

@Composable
private fun MeasurementField(
    label: String,
    value: String,
    suffix: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier,
        label = { Text(label) },
        suffix = { Text(suffix) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        shape = RoundedCornerShape(16.dp),
    )
}

@Composable
private fun ActivityCard(
    activity: DailyActivityOption,
    selected: Boolean,
    onClick: () -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (selected) {
                MaterialTheme.colorScheme.primaryContainer
            } else {
                MaterialTheme.colorScheme.surface
            },
        ),
        border = if (selected) BorderStroke(1.5.dp, MaterialTheme.colorScheme.primary) else null,
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = activity.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                )
                Text(
                    text = activity.description,
                    modifier = Modifier.padding(top = 2.dp),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            RadioButton(selected = selected, onClick = onClick)
        }
    }
}

private fun String.onlyDigits(maxLength: Int): String = filter(Char::isDigit).take(maxLength)
