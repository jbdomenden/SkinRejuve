package com.clinicportal.serialization

import kotlinx.serialization.json.Json

object JsonConfig {
    val default: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }
}
