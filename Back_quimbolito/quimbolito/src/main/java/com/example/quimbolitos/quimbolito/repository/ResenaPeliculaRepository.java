package com.example.quimbolitos.quimbolito.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.ResenaPelicula;

public interface ResenaPeliculaRepository extends JpaRepository<ResenaPelicula, Long> {

    List<ResenaPelicula> findAllByPelicula_IdOrderByFechaActualizacionAsc(Long peliculaId);

    Optional<ResenaPelicula> findByPelicula_IdAndUsuario_Id(Long peliculaId, Long usuarioId);
}
