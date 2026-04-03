package com.srithaoils.backend.controller;

import com.srithaoils.backend.dto.address.AddressResponse;
import com.srithaoils.backend.dto.address.CreateAddressRequest;
import com.srithaoils.backend.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse addAddress(
            Authentication authentication,
            @Valid @RequestBody CreateAddressRequest request) {
        return addressService.addAddress(authenticatedPhone(authentication), request);
    }

    @GetMapping
    public List<AddressResponse> getAddresses(Authentication authentication) {
        return addressService.getAddresses(authenticatedPhone(authentication));
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
