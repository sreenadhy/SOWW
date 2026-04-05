package com.srithaoils.backend.service;

import com.srithaoils.backend.dto.address.AddressResponse;
import com.srithaoils.backend.dto.auth.UserProfileResponse;
import com.srithaoils.backend.dto.profile.ProfileResponse;
import com.srithaoils.backend.dto.profile.UpdateProfileRequest;
import com.srithaoils.backend.entity.User;
import com.srithaoils.backend.exception.ResourceNotFoundException;
import com.srithaoils.backend.repository.AddressRepository;
import com.srithaoils.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public ProfileService(UserRepository userRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String primaryPhoneNumber) {
        User user = getUser(primaryPhoneNumber);
        return new ProfileResponse(mapUser(user), getAddressResponses(user.getId()));
    }

    @Transactional
    public UserProfileResponse updateProfile(String primaryPhoneNumber, UpdateProfileRequest request) {
        User user = getUser(primaryPhoneNumber);
        user.setName(request.name().trim());
        user.setEmail(request.email() == null ? null : request.email().trim());
        user.setSecondaryPhoneNumber(
                request.secondaryPhoneNumber() == null ? null : request.secondaryPhoneNumber().trim());
        return mapUser(userRepository.save(user));
    }

    private User getUser(String primaryPhoneNumber) {
        return userRepository.findByPrimaryPhoneNumber(primaryPhoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private UserProfileResponse mapUser(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getPrimaryPhoneNumber(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    private List<AddressResponse> getAddressResponses(Long userId) {
        return addressRepository.findAllByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(address -> new AddressResponse(
                        address.getId(),
                        address.getUser().getId(),
                        address.getFullAddress(),
                        address.getCity(),
                        address.getState(),
                        address.getPincode(),
                        Boolean.TRUE.equals(address.getIsDefault()),
                        address.getCreatedAt()
                ))
                .toList();
    }
}
