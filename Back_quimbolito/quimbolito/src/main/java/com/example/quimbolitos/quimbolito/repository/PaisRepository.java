package com.example.quimbolitos.quimbolito.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.Pais;

public interface PaisRepository extends JpaRepository<Pais, Long> {

    Optional<Pais> findByNombre(String nombre);
    Optional<Pais> findByCodigoIso(String codigoIso);
}