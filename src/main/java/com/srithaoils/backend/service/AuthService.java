package com.srithaoils.backend.service;

import com.srithaoils.backend.dto.auth.AuthResponse;
import com.srithaoils.backend.dto.auth.OtpRequestRequest;
import com.srithaoils.backend.dto.auth.OtpRequestResponse;
import com.srithaoils.backend.dto.auth.OtpVerifyRequest;
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

    private static final String DEFAULT_ROLE = "ROLE_USER";

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
    public OtpRequestResponse requestOtp(OtpRequestRequest request) {
        userRepository.findByPhoneNumber(request.phoneNumber())
                .orElseGet(() -> userRepository.save(new User(request.phoneNumber(), DEFAULT_ROLE)));

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

        User user = userRepository.findByPhoneNumber(request.phoneNumber())
                .orElseGet(() -> userRepository.save(new User(request.phoneNumber(), DEFAULT_ROLE)));
        user.setLastVerifiedAt(LocalDateTime.now());

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.extractExpiration(token),
                user.getId(),
                user.getPhoneNumber()
        );
    }
}
