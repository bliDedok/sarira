package com.sarira.wellness.core.designsystem.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

private val Green10 = Color(0xFF002019)
private val Green20 = Color(0xFF00382C)
private val Green40 = Color(0xFF006B57)
private val Green80 = Color(0xFF55DBBA)
private val Green90 = Color(0xFF75F8D6)

private val Sage20 = Color(0xFF1D352D)
private val Sage40 = Color(0xFF4B635B)
private val Sage80 = Color(0xFFB2CCC1)
private val Sage90 = Color(0xFFCDE8DD)

private val Blue20 = Color(0xFF073543)
private val Blue40 = Color(0xFF3E6374)
private val Blue80 = Color(0xFFA5CDDF)
private val Blue90 = Color(0xFFC1E9FC)

private val Neutral10 = Color(0xFF171D1A)
private val Neutral20 = Color(0xFF2B322F)
private val Neutral80 = Color(0xFFC4C9C5)
private val Neutral90 = Color(0xFFE0E4E0)
private val Neutral95 = Color(0xFFEEF2EE)
private val Neutral99 = Color(0xFFF8FCF8)

private val Error40 = Color(0xFFBA1A1A)
private val Error80 = Color(0xFFFFB4AB)

internal val SariraLightColorScheme = lightColorScheme(
    primary = Green40,
    onPrimary = Color.White,
    primaryContainer = Green90,
    onPrimaryContainer = Green10,
    secondary = Sage40,
    onSecondary = Color.White,
    secondaryContainer = Sage90,
    onSecondaryContainer = Sage20,
    tertiary = Blue40,
    onTertiary = Color.White,
    tertiaryContainer = Blue90,
    onTertiaryContainer = Blue20,
    background = Neutral99,
    onBackground = Neutral10,
    surface = Neutral99,
    onSurface = Neutral10,
    surfaceVariant = Neutral90,
    onSurfaceVariant = Neutral20,
    outline = Sage40,
    error = Error40,
    onError = Color.White,
)

internal val SariraDarkColorScheme = darkColorScheme(
    primary = Green80,
    onPrimary = Green20,
    primaryContainer = Green40,
    onPrimaryContainer = Green90,
    secondary = Sage80,
    onSecondary = Sage20,
    secondaryContainer = Sage40,
    onSecondaryContainer = Sage90,
    tertiary = Blue80,
    onTertiary = Blue20,
    tertiaryContainer = Blue40,
    onTertiaryContainer = Blue90,
    background = Neutral10,
    onBackground = Neutral90,
    surface = Neutral10,
    onSurface = Neutral90,
    surfaceVariant = Neutral20,
    onSurfaceVariant = Neutral80,
    outline = Neutral80,
    error = Error80,
    onError = Error40,
)
