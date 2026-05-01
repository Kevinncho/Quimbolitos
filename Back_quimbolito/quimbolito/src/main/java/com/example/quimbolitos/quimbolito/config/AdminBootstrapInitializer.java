package com.example.quimbolitos.quimbolito.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.quimbolitos.quimbolito.entity.RolUsuario;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrapInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminBootstrapProperties properties;

    @Override
    public void run(String... args) {
        if (!properties.enabled()) {
            return;
        }

        if (isBlank(properties.email()) || isBlank(properties.password()) || isBlank(properties.nombre())) {
            log.warn("No se creo el admin bootstrap porque faltan propiedades obligatorias.");
            return;
        }

        String email = properties.email().trim().toLowerCase();

        Usuario admin = usuarioRepository.findByEmail(email)
                .map(existing -> {
                    existing.setNombre(properties.nombre().trim());
                    existing.setAlias(clean(properties.alias()));
                    existing.setPassword(passwordEncoder.encode(properties.password()));
                    existing.setRol(RolUsuario.ADMIN);
                    existing.setFechaNacimiento(properties.fechaNacimiento());
                    existing.setBiografia(clean(properties.biografia()));
                    existing.setFotoPerfil(clean(properties.fotoPerfil()));
                    return existing;
                })
                .orElseGet(() -> Usuario.builder()
                        .nombre(properties.nombre().trim())
                        .alias(clean(properties.alias()))
                        .email(email)
                        .password(passwordEncoder.encode(properties.password()))
                        .rol(RolUsuario.ADMIN)
                        .fechaNacimiento(properties.fechaNacimiento())
                        .biografia(clean(properties.biografia()))
                        .fotoPerfil(clean(properties.fotoPerfil()))
                        .build());

        Usuario savedAdmin = usuarioRepository.save(admin);
        log.warn("Usuario administrador bootstrap asegurado con email: {}", savedAdmin.getEmail());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String clean(String value) {
        return isBlank(value) ? null : value.trim();
    }
}
