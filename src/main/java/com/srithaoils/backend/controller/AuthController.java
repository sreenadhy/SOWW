package com.srithaoils.backend.controller;

import com.srithaoils.backend.dto.auth.AuthResponse;
import com.srithaoils.backend.dto.auth.OtpRequestRequest;
import com.srithaoils.backend.dto.auth.OtpRequestResponse;
import com.srithaoils.backend.dto.auth.OtpVerifyRequest;
import com.srithaoils.backend.dto.auth.RegisterRequest;
import com.srithaoils.backend.dto.auth.TotpSetupRequest;
import com.srithaoils.backend.dto.auth.TotpSetupResponse;
import com.srithaoils.backend.dto.auth.TotpSetupVerifyRequest;
import com.srithaoils.backend.dto.auth.TotpVerifyRequest;
import com.srithaoils.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/request-otp")
    public OtpRequestResponse requestOtp(@Valid @RequestBody OtpRequestRequest request) {
        return authService.requestOtp(request);
    }

    @PostMapping("/verify-otp")
    public AuthResponse verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return authService.verifyOtp(request);
    }

    @PostMapping("/totp/setup/initiate")
    public TotpSetupResponse initiateTotpSetup(@Valid @RequestBody TotpSetupRequest request) {
        return authService.initiateTotpSetup(request);
    }

    @PostMapping("/totp/setup/verify")
    public TotpSetupResponse verifyTotpSetup(@Valid @RequestBody TotpSetupVerifyRequest request) {
        return authService.verifyAndCompleteTotpSetup(request);
    }

    @PostMapping("/verify-totp")
    public AuthResponse verifyTotp(@Valid @RequestBody TotpVerifyRequest request) {
        return authService.verifyTotp(request);
    }
}
