package com.srithaoils.backend.dto.auth;

public record TotpVerifyRequest(
        String phoneNumber,
        String code
) {
}

