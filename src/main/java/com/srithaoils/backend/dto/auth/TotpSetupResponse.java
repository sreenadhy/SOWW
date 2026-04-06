package com.srithaoils.backend.dto.auth;

public record TotpSetupResponse(
        String secret,
        String qrCodeUri,
        String message
) {
}

