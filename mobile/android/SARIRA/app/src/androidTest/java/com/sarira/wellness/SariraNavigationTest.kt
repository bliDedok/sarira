package com.sarira.wellness

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test

class SariraNavigationTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun exploreAsGuest_opensGuestHomeDashboard() {
        composeRule.waitUntil(timeoutMillis = 6_000) {
            composeRule.onAllNodesWithText("Jelajahi dulu").fetchSemanticsNodes().isNotEmpty()
        }

        composeRule.onNodeWithText("Jelajahi dulu").performClick()

        composeRule.onNodeWithText("Halo, Teman SARIRA").assertIsDisplayed()
        composeRule.onNodeWithText("Buat Program Saya").assertIsDisplayed()
        composeRule.onNodeWithText("Home").assertIsDisplayed()

        composeRule.onNodeWithText("Food").performClick()
        composeRule.onNodeWithText(
            "Ruang ini sedang disiapkan untuk pengalaman SARIRA berikutnya.",
        ).assertIsDisplayed()
    }

    @Test
    fun createProgram_finishesOnPersonalHomeDashboard() {
        composeRule.waitUntil(timeoutMillis = 6_000) {
            composeRule.onAllNodesWithText("Mulai").fetchSemanticsNodes().isNotEmpty()
        }

        composeRule.onNodeWithText("Mulai").performClick()
        composeRule.onNodeWithText("Menjaga kesehatan").performClick()
        composeRule.onNodeWithText("Lanjutkan").performClick()

        composeRule.onNodeWithText("Kenali ritmemu").assertIsDisplayed()
        composeRule.onNodeWithText("Lihat program saya").performClick()

        composeRule.onNodeWithText("Program Ritme Sehat 21 Hari").assertIsDisplayed()
        composeRule.onNodeWithText("Gunakan program ini").performClick()

        composeRule.onNodeWithText("Selamat pagi, Teman SARIRA").assertIsDisplayed()
        composeRule.onNodeWithText("Program Ritme Sehat 21 Hari").assertIsDisplayed()
        composeRule.onNodeWithText("Home").assertIsDisplayed()
    }
}
