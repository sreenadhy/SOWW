package com.srithaoils.backend.controller;

import com.srithaoils.backend.dto.auth.UserProfileResponse;
import com.srithaoils.backend.dto.profile.ProfileResponse;
import com.srithaoils.backend.dto.profile.UpdateProfileRequest;
import com.srithaoils.backend.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ProfileResponse getProfile(Authentication authentication) {
        return profileService.getProfile(authenticatedPhone(authentication));
    }

    @PutMapping
    public UserProfileResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        return profileService.updateProfile(authenticatedPhone(authentication), request);
    }

    private String authenticatedPhone(Authentication authentication) {
        if (authentication == null
                || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new AuthenticationCredentialsNotFoundException("Authentication is required");
        }

        return authentication.getName();
    }
}
