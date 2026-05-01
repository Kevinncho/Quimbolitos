package com.example.quimbolitos.quimbolito.config;

import java.time.LocalDate;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.admin.bootstrap")
public record AdminBootstrapProperties(
        boolean enabled,
        String nombre,
        String alias,
        String email,
        String password,
        LocalDate fechaNacimiento,
        String biografia,
        String fotoPerfil) {
}
