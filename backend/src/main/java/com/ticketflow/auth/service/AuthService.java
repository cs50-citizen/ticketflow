package com.ticketflow.auth.service;

import com.ticketflow.auth.dto.AuthDto;
import com.ticketflow.auth.model.Role;
import com.ticketflow.auth.model.User;
import com.ticketflow.auth.repository.UserRepository;
import com.ticketflow.common.BusinessException;
import com.ticketflow.config.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use: " + request.getEmail(), HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(Role.CUSTOMER)
                .build();

        User saved = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(saved);

        return AuthDto.AuthResponse.builder()
                .token(token)
                .userId(saved.getId())
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .role(saved.getRole())
                .build();
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtTokenProvider.generateToken(user);

        return AuthDto.AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}

