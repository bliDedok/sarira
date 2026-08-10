package com.sarira.wellness

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.sarira.wellness.core.designsystem.theme.SariraTheme
import com.sarira.wellness.core.navigation.SariraApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SariraTheme {
                SariraApp()
            }
        }
    }
}
