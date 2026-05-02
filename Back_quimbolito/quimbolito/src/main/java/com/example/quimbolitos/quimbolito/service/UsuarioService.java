package com.example.quimbolitos.quimbolito.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.config.AdminBootstrapProperties;
import com.example.quimbolitos.quimbolito.dto.user.UpdateUsuarioRequest;
import com.example.quimbolitos.quimbolito.dto.user.UsuarioResponse;
import com.example.quimbolitos.quimbolito.entity.RolUsuario;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.UsuarioRepository;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final AdminBootstrapProperties adminBootstrapProperties;

    @Transactional(readOnly = true)
    public UsuarioResponse getProfile(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));
        return toUsuarioResponse(usuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> findAll() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toUsuarioResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse findById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return toUsuarioResponse(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse findByEmail(String email, Authentication authentication) {
        Usuario actual = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));

        Usuario usuario = usuarioRepository.findByEmail(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (usuario.getId().equals(actual.getId())) {
            throw new IllegalArgumentException("No puedes buscarte a ti mismo");
        }

        return toUsuarioResponse(usuario);
    }

    @Transactional
    public UsuarioResponse updateMyProfile(Authentication authentication, UpdateUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));

        applyUpdates(usuario, request);
        return toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse updateMyProfilePhoto(Authentication authentication, MultipartFile file) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));

        usuario.setFotoPerfil(fileStorageService.storeProfilePhoto(file));
        return toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void deleteMyProfile(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));
        usuarioRepository.delete(usuario);
    }

    @Transactional
    public UsuarioResponse enableCurrentUserAsAdmin(Authentication authentication) {
        if (!adminBootstrapProperties.enabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La promocion admin de desarrollo no esta habilitada");
        }

        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));

        usuario.setRol(RolUsuario.ADMIN);
        return toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse updateById(Long id, UpdateUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        applyUpdates(usuario, request);
        return toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void deleteById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        usuarioRepository.delete(usuario);
    }

    private void applyUpdates(Usuario usuario, UpdateUsuarioRequest request) {
        if (request.getNombre() != null) {
            usuario.setNombre(request.getNombre());
        }

        if (request.getAlias() != null) {
            usuario.setAlias(request.getAlias().trim().isEmpty() ? null : request.getAlias().trim());
        }

        if (request.getEmail() != null && !request.getEmail().equals(usuario.getEmail())) {
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Ya existe un usuario con ese email");
            }
            usuario.setEmail(request.getEmail());
        }

        if (request.getPassword() != null) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getFechaNacimiento() != null) {
            usuario.setFechaNacimiento(request.getFechaNacimiento());
        }

        if (request.getBiografia() != null) {
            usuario.setBiografia(request.getBiografia());
        }

        if (request.getFotoPerfil() != null) {
            usuario.setFotoPerfil(request.getFotoPerfil());
        }

        if (request.getLatitud() != null) {
            usuario.setLatitud(request.getLatitud());
        }

        if (request.getLongitud() != null) {
            usuario.setLongitud(request.getLongitud());
        }
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
                .latitud(usuario.getLatitud())
                .longitud(usuario.getLongitud())
                .build();
    }
}
