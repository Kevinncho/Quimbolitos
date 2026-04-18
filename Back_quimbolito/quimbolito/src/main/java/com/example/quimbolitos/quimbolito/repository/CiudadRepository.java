package com.example.quimbolitos.quimbolito.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.Ciudad;

public interface CiudadRepository extends JpaRepository<Ciudad, Long> {

    Optional<Ciudad> findByNombreAndPais_Id(String nombre, Long paisId);
    List<Ciudad> findAllByPais_Id(Long paisId);
}