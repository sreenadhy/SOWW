package com.srithaoils.backend.service;

import com.srithaoils.backend.dto.auth.AuthResponse;
import com.srithaoils.backend.dto.auth.OtpRequestRequest;
import com.srithaoils.backend.dto.auth.OtpRequestResponse;
import com.srithaoils.backend.dto.auth.OtpVerifyRequest;
import com.srithaoils.backend.dto.auth.RegisterRequest;
import com.srithaoils.backend.dto.auth.TotpSetupRequest;
import com.srithaoils.backend.dto.auth.TotpSetupResponse;
import com.srithaoils.backend.dto.auth.TotpSetupVerifyRequest;
import com.srithaoils.backend.dto.auth.TotpVerifyRequest;
import com.srithaoils.backend.entity.User;
import com.srithaoils.backend.repository.UserRepository;
import com.srithaoils.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpStore otpStore;
    private final SmsService smsService;
    private final TotpService totpService;
    private final JwtService jwtService;
    private final long otpExpiryMinutes;
    private final boolean devReturnOtp;

    public AuthService(
            UserRepository userRepository,
            OtpStore otpStore,
            SmsService smsService,
            TotpService totpService,
            JwtService jwtService,
            @Value("${app.auth.otp-expiry-minutes}") long otpExpiryMinutes,
            @Value("${app.auth.dev-return-otp}") boolean devReturnOtp) {
        this.userRepository = userRepository;
        this.otpStore = otpStore;
        this.smsService = smsService;
        this.totpService = totpService;
        this.jwtService = jwtService;
        this.otpExpiryMinutes = otpExpiryMinutes;
        this.devReturnOtp = devReturnOtp;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByPrimaryPhoneNumber(request.primaryPhoneNumber())) {
            throw new IllegalArgumentException("A user already exists with this primary phone number");
        }

        User user = new User(
                request.primaryPhoneNumber(),
                request.secondaryPhoneNumber(),
                request.name().trim(),
                request.email() == null ? null : request.email().trim()
        );

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.extractExpiration(token),
                savedUser.getId(),
                savedUser.getPrimaryPhoneNumber(),
                true,
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    @Transactional(readOnly = true)
    public OtpRequestResponse requestOtp(OtpRequestRequest request) {
        OtpStore.OtpDetails otpDetails = otpStore.issueOtp(
                request.phoneNumber(),
                Duration.ofMinutes(otpExpiryMinutes)
        );

        // Send OTP via SMS to real phone number
        smsService.sendOtpSms(request.phoneNumber(), otpDetails.otp());

        return new OtpRequestResponse(
                "OTP generated successfully",
                otpDetails.expiresAt(),
                devReturnOtp ? otpDetails.otp() : null
        );
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        otpStore.verifyOtp(request.phoneNumber(), request.otp());

        User user = userRepository.findByPrimaryPhoneNumber(request.phoneNumber()).orElse(null);
        if (user == null) {
            return new AuthResponse(
                    null,
                    null,
                    null,
                    null,
                    request.phoneNumber(),
                    false,
                    null,
                    null
            );
        }

        user.setLastVerifiedAt(LocalDateTime.now());
        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.extractExpiration(token),
                user.getId(),
                user.getPrimaryPhoneNumber(),
                true,
                user.getName(),
                user.getEmail()
        );
    }

    @Transactional(readOnly = true)
    public TotpSetupResponse initiateTotpSetup(TotpSetupRequest request) {
        User user = userRepository.findByPrimaryPhoneNumber(request.phoneNumber())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String secret = totpService.generateSecret();
        String qrCodeUri = totpService.generateProvisioningUri(
                secret,
                user.getPrimaryPhoneNumber(),
                "Sritha Oils"
        );

        return new TotpSetupResponse(
                secret,
                qrCodeUri,
                "Scan the QR code with Google Authenticator or enter the secret manually"
        );
    }

    @Transactional
    public TotpSetupResponse verifyAndCompleteTotpSetup(TotpSetupVerifyRequest request) {
        User user = userRepository.findByPrimaryPhoneNumber(request.phoneNumber())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify the TOTP code using the provided secret
        if (!totpService.verifyCode(request.secret(), request.code())) {
            throw new IllegalArgumentException("Invalid TOTP code");
        }

        // Save the secret and enable TOTP for the user
        user.setTotpSecret(request.secret());
        user.setTotpEnabled(true);
        user.setTotpSetupPending(false);
        userRepository.save(user);

        String qrCodeUri = totpService.generateProvisioningUri(
                user.getTotpSecret(),
                user.getPrimaryPhoneNumber(),
                "Sritha Oils"
        );

        return new TotpSetupResponse(
                user.getTotpSecret(),
                qrCodeUri,
                "TOTP setup completed successfully"
        );
    }

    @Transactional
    public AuthResponse verifyTotp(TotpVerifyRequest request) {
        User user = userRepository.findByPrimaryPhoneNumber(request.phoneNumber())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isTotpEnabled() || user.getTotpSecret() == null) {
            throw new IllegalArgumentException("TOTP not enabled for this user");
        }

        if (!totpService.verifyCode(user.getTotpSecret(), request.code())) {
            throw new IllegalArgumentException("Invalid TOTP code");
        }

        user.setLastVerifiedAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.extractExpiration(token),
                user.getId(),
                user.getPrimaryPhoneNumber(),
                true,
                user.getName(),
                user.getEmail()
        );
    }
}
