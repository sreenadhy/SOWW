package com.srithaoils.backend.dto.auth;

public record TotpSetupVerifyRequest(
        String phoneNumber,
        String code
) {
}

