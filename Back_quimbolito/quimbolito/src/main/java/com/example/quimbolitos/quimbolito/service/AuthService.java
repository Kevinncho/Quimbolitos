package com.example.quimbolitos.quimbolito.service;

import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.quimbolitos.quimbolito.dto.auth.AuthResponse;
import com.example.quimbolitos.quimbolito.dto.auth.LoginRequest;
import com.example.quimbolitos.quimbolito.dto.auth.RegisterRequest;
import com.example.quimbolitos.quimbolito.dto.user.CreateAdminRequest;
import com.example.quimbolitos.quimbolito.dto.user.UsuarioResponse;
import com.example.quimbolitos.quimbolito.entity.RolUsuario;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.UsuarioRepository;
import com.example.quimbolitos.quimbolito.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        validateEmailAvailable(request.getEmail());

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .alias(request.getAlias())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fechaNacimiento(request.getFechaNacimiento())
                .biografia(request.getBiografia())
                .fotoPerfil(request.getFotoPerfil())
                .rol(RolUsuario.USER)
                .build();

        Usuario savedUser = usuarioRepository.save(usuario);
        return buildAuthResponse(savedUser);
    }

    @Transactional
    public UsuarioResponse createAdmin(CreateAdminRequest request) {
        validateEmailAvailable(request.getEmail());

        Usuario admin = Usuario.builder()
                .nombre(request.getNombre())
                .alias(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fechaNacimiento(request.getFechaNacimiento())
                .biografia(request.getBiografia())
                .fotoPerfil(request.getFotoPerfil())
                .rol(RolUsuario.ADMIN)
                .build();

        return toUsuarioResponse(usuarioRepository.save(admin));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales incorrectas"));

        return buildAuthResponse(usuario);
    }

    private AuthResponse buildAuthResponse(Usuario usuario) {
        User userDetails = new User(
                usuario.getEmail(),
                usuario.getPassword(),
                java.util.List.of(() -> "ROLE_" + usuario.getRol().name()));

        String token = jwtService.generateToken(
                userDetails,
                Map.of(
                        "role", usuario.getRol().name(),
                        "userId", usuario.getId()));

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .usuario(toUsuarioResponse(usuario))
                .build();
    }

    private UsuarioResponse toUsuarioResponse(Usuario usuario) {
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .alias(usuario.getAlias())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .fotoPerfil(usuario.getFotoPerfil())
                .fechaNacimiento(usuario.getFechaNacimiento())
                .biografia(usuario.getBiografia())
                .build();
    }

    private void validateEmailAvailable(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }
    }
}
