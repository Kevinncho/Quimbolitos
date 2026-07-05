package com.example.quimbolitos.quimbolito.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.Pelicula;

public interface PeliculaRepository extends JpaRepository<Pelicula, Long> {

    List<Pelicula> findAllByUsuario_IdOrderByFechaCreacionDesc(Long usuarioId);

    List<Pelicula> findAllByUsuario_IdInOrderByFechaCreacionDesc(List<Long> usuarioIds);
}
