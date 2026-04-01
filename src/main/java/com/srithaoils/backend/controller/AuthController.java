package com.srithaoils.backend.controller;

import com.srithaoils.backend.dto.auth.AuthResponse;
import com.srithaoils.backend.dto.auth.OtpRequestRequest;
import com.srithaoils.backend.dto.auth.OtpRequestResponse;
import com.srithaoils.backend.dto.auth.OtpVerifyRequest;
import com.srithaoils.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/request-otp")
    public OtpRequestResponse requestOtp(@Valid @RequestBody OtpRequestRequest request) {
        return authService.requestOtp(request);
    }

    @PostMapping("/verify-otp")
    public AuthResponse verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return authService.verifyOtp(request);
    }
}
