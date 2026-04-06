package com.srithaoils.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class SmsService {

    private final JavaMailSender mailSender;
    private final boolean smsSendingEnabled;
    private final String gmailUsername;

    public SmsService(@Value("${app.sms.enabled:false}") boolean smsSendingEnabled,
                      @Value("${app.sms.gmail.username:}") String gmailUsername,
                      @Value("${app.sms.gmail.password:}") String gmailPassword) {
        this.smsSendingEnabled = smsSendingEnabled;
        this.gmailUsername = gmailUsername;

        if (smsSendingEnabled && gmailUsername != null && !gmailUsername.isEmpty()) {
            JavaMailSenderImpl mailSenderImpl = new JavaMailSenderImpl();
            mailSenderImpl.setHost("smtp.gmail.com");
            mailSenderImpl.setPort(587);
            mailSenderImpl.setUsername(gmailUsername);
            mailSenderImpl.setPassword(gmailPassword);

            Properties props = mailSenderImpl.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.debug", "false");

            this.mailSender = mailSenderImpl;
        } else {
            this.mailSender = null;
        }
    }

    /**
     * Send OTP via SMS using email-to-SMS gateway
     * @param phoneNumber Phone number (10 digits for India)
     * @param otp The OTP code to send
     * @return true if sent successfully or if SMS is disabled, false otherwise
     */
    public boolean sendOtpSms(String phoneNumber, String otp) {
        if (!smsSendingEnabled) {
            System.out.println("[SMS DISABLED] Would send OTP " + otp + " to " + phoneNumber);
            return true; // Treat as success for dev mode
        }

        if (mailSender == null) {
            System.out.println("[SMS CONFIG ERROR] Gmail not configured. Set APP_SMS_GMAIL_USERNAME and APP_SMS_GMAIL_PASSWORD");
            return false;
        }

        try {
            // Convert phone number to email address for SMS gateway
            String smsEmail = convertPhoneToSmsEmail(phoneNumber);

            String message = "Your Sritha Oils verification code is: " + otp + ". Valid for 2 minutes.";

            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(gmailUsername); // Use Gmail username as from
            mailMessage.setTo(smsEmail);
            mailMessage.setSubject(""); // Empty subject for SMS
            mailMessage.setText(message);

            mailSender.send(mailMessage);
            System.out.println("SMS sent successfully to " + phoneNumber + " via email gateway");
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send SMS: " + e.getMessage());
            return false;
        }
    }

    /**
     * Convert phone number to SMS email address
     * Different carriers have different email formats
     * This is a basic implementation - you may need to customize for specific carriers
     */
    private String convertPhoneToSmsEmail(String phoneNumber) {
        // Remove any non-digit characters
        String cleanNumber = phoneNumber.replaceAll("\\D", "");

        // For India, try common carriers
        // You can add more carrier mappings as needed

        // Example: Vodafone Idea, Airtel, Jio, etc.
        // Most Indian carriers support @sms.airtel.in or similar
        // This is a simplified approach - in production, you'd need carrier detection

        if (cleanNumber.length() == 10) {
            // Try Airtel format (common in India)
            return cleanNumber + "@sms.airtel.in";
        }

        // Fallback - this won't work, but shows the concept
        return cleanNumber + "@txt.att.net"; // Example for AT&T in US
    }

    /**
     * Alternative: Use a free SMS service API
     * You can integrate with services like Textbelt, Twilio free tier, etc.
     */
    public boolean sendOtpSmsViaApi(String phoneNumber, String otp) {
        if (!smsSendingEnabled) {
            System.out.println("[SMS DISABLED] Would send OTP " + otp + " to " + phoneNumber);
            return true;
        }

        // Example using a free SMS API (you'd need to sign up)
        // This is just a template - replace with actual API

        try {
            String message = "Your Sritha Oils verification code is: " + otp + ". Valid for 2 minutes.";
            String apiUrl = "https://api.example.com/send-sms"; // Replace with real API

            // Use HttpClient or RestTemplate to call the API
            // For now, just log it
            System.out.println("Would send SMS to " + phoneNumber + ": " + message);
            System.out.println("API URL: " + apiUrl);

            return true; // Pretend it worked
        } catch (Exception e) {
            System.err.println("Failed to send SMS via API: " + e.getMessage());
            return false;
        }
    }
}
