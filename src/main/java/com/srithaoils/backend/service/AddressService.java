package com.srithaoils.backend.service;

import com.srithaoils.backend.dto.address.AddressResponse;
import com.srithaoils.backend.dto.address.CreateAddressRequest;
import com.srithaoils.backend.dto.address.UpdateAddressRequest;
import com.srithaoils.backend.entity.Address;
import com.srithaoils.backend.entity.User;
import com.srithaoils.backend.exception.ResourceNotFoundException;
import com.srithaoils.backend.repository.AddressRepository;
import com.srithaoils.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AddressResponse addAddress(String primaryPhoneNumber, CreateAddressRequest request) {
        User user = userRepository.findByPrimaryPhoneNumber(primaryPhoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        List<Address> existingAddresses = addressRepository.findAllByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
        boolean shouldBeDefault = Boolean.TRUE.equals(request.isDefault()) || existingAddresses.isEmpty();

        if (shouldBeDefault) {
            existingAddresses.forEach(existingAddress -> existingAddress.setIsDefault(Boolean.FALSE));
        }

        Address address = new Address();
        address.setUser(user);
        address.setFullAddress(request.fullAddress().trim());
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setPincode(request.pincode().trim());
        address.setIsDefault(shouldBeDefault);

        Address savedAddress = addressRepository.save(address);
        return mapAddress(savedAddress);
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(String primaryPhoneNumber) {
        User user = userRepository.findByPrimaryPhoneNumber(primaryPhoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        return addressRepository.findAllByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapAddress)
                .toList();
    }

    @Transactional
    public AddressResponse updateAddress(String primaryPhoneNumber, Long addressId, UpdateAddressRequest request) {
        User user = userRepository.findByPrimaryPhoneNumber(primaryPhoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found for this user"));

        List<Address> existingAddresses = addressRepository.findAllByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
        boolean shouldBeDefault = Boolean.TRUE.equals(request.isDefault());

        if (shouldBeDefault) {
            existingAddresses.stream()
                    .filter(existingAddress -> !existingAddress.getId().equals(address.getId()))
                    .forEach(existingAddress -> existingAddress.setIsDefault(Boolean.FALSE));
        }

        address.setFullAddress(request.fullAddress().trim());
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setPincode(request.pincode().trim());
        address.setIsDefault(shouldBeDefault || Boolean.TRUE.equals(address.getIsDefault()));

        return mapAddress(addressRepository.save(address));
    }

    private AddressResponse mapAddress(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getUser().getId(),
                address.getFullAddress(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                Boolean.TRUE.equals(address.getIsDefault()),
                address.getCreatedAt()
        );
    }
}
