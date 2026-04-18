package com.example.quimbolitos.quimbolito.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.Cancion;

public interface CancionRepository extends JpaRepository<Cancion, Long> {

    List<Cancion> findAllByUsuario_IdOrderByIdDesc(Long usuarioId);

    List<Cancion> findAllByUsuario_IdInOrderByIdDesc(List<Long> usuarioIds);
}
