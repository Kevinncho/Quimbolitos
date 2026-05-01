package com.example.quimbolitos.quimbolito.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.RolUsuario;
import com.example.quimbolitos.quimbolito.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRol(RolUsuario rol);
}
