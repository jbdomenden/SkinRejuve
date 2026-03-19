package zeroday.skinrejuve.services

import zeroday.skinrejuve.config.MailConfig
import jakarta.mail.Authenticator
import jakarta.mail.Message
import jakarta.mail.MessagingException
import jakarta.mail.PasswordAuthentication
import jakarta.mail.Session
import jakarta.mail.Transport
import jakarta.mail.internet.InternetAddress
import jakarta.mail.internet.MimeMessage
import java.util.Properties

class MailService(private val mailConfig: MailConfig) {
    fun send(to: String, subject: String, body: String) {
        val props = Properties().apply {
            put("mail.smtp.host", mailConfig.host)
            put("mail.smtp.port", mailConfig.port.toString())
            put("mail.smtp.auth", (!mailConfig.username.isBlank()).toString())
            put("mail.smtp.starttls.enable", mailConfig.useTls.toString())
            put("mail.smtp.starttls.required", mailConfig.useTls.toString())
            put("mail.smtp.ssl.protocols", "TLSv1.2")
            put("mail.smtp.connectiontimeout", "10000")
            put("mail.smtp.timeout", "10000")
            put("mail.smtp.writetimeout", "10000")
        }

        val session = if (mailConfig.username.isBlank()) {
            Session.getInstance(props)
        } else {
            Session.getInstance(
                props,
                object : Authenticator() {
                    override fun getPasswordAuthentication(): PasswordAuthentication {
                        return PasswordAuthentication(mailConfig.username, mailConfig.password)
                    }
                }
            )
        }

        val message = MimeMessage(session).apply {
            setFrom(InternetAddress(mailConfig.from))
            setRecipients(Message.RecipientType.TO, InternetAddress.parse(to))
            this.subject = subject
            setText(body)
        }

        try {
            Transport.send(message)
        } catch (ex: MessagingException) {
            throw IllegalStateException("Failed to send email", ex)
        }
    }
}
