package com.clinicportal.utils

object Validators {
    private val emailRegex = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")

    fun requireEmail(email: String): String {
        val normalized = email.trim().lowercase()
        require(emailRegex.matches(normalized)) { "Invalid email" }
        return normalized
    }

    fun requirePasswordStrength(password: String) {
        require(password.length >= 8) { "Password must have at least 8 characters" }
        require(password.any { it.isUpperCase() }) { "Password must include at least one uppercase letter" }
        require(password.any { it.isLowerCase() }) { "Password must include at least one lowercase letter" }
        require(password.any { it.isDigit() }) { "Password must include at least one number" }
    }

    fun requireNonBlank(value: String, fieldName: String): String {
        val normalized = value.trim()
        require(normalized.isNotBlank()) { "$fieldName cannot be blank" }
        return normalized
    }
}
