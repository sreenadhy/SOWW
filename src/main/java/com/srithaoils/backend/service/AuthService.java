package com.srithaoils.backend.service;

import com.srithaoils.backend.dto.auth.AuthResponse;
import com.srithaoils.backend.dto.auth.OtpRequestRequest;
import com.srithaoils.backend.dto.auth.OtpRequestResponse;
import com.srithaoils.backend.dto.auth.OtpVerifyRequest;
import com.srithaoils.backend.dto.auth.RegisterRequest;
import com.srithaoils.backend.dto.auth.RegisterResponse;
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
    private final JwtService jwtService;
    private final long otpExpiryMinutes;
    private final boolean devReturnOtp;

    public AuthService(
            UserRepository userRepository,
            OtpStore otpStore,
            JwtService jwtService,
            @Value("${app.auth.otp-expiry-minutes}") long otpExpiryMinutes,
            @Value("${app.auth.dev-return-otp}") boolean devReturnOtp) {
        this.userRepository = userRepository;
        this.otpStore = otpStore;
        this.jwtService = jwtService;
        this.otpExpiryMinutes = otpExpiryMinutes;
        this.devReturnOtp = devReturnOtp;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByPrimaryPhoneNumber(request.primaryPhoneNumber())) {
            throw new IllegalArgumentException("A user already exists with this primary phone number");
        }

        User user = new User(
                request.primaryPhoneNumber(),
                request.secondaryPhoneNumber(),
                request.name().trim()
        );

        User savedUser = userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getPrimaryPhoneNumber(),
                savedUser.getSecondaryPhoneNumber(),
                savedUser.getName(),
                savedUser.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public OtpRequestResponse requestOtp(OtpRequestRequest request) {
        OtpStore.OtpDetails otpDetails = otpStore.issueOtp(
                request.phoneNumber(),
                Duration.ofMinutes(otpExpiryMinutes)
        );

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
                user.getName()
        );
    }
}
