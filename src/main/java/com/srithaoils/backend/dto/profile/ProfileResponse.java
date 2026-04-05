package com.srithaoils.backend.dto.profile;

import com.srithaoils.backend.dto.address.AddressResponse;
import com.srithaoils.backend.dto.auth.UserProfileResponse;

import java.util.List;

public record ProfileResponse(
        UserProfileResponse user,
        List<AddressResponse> addresses
) {
}
