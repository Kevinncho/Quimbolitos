package com.example.quimbolitos.quimbolito.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.EstadoEmocional;

public interface EstadoEmocionalRepository extends JpaRepository<EstadoEmocional, Long> {

    List<EstadoEmocional> findAllByPareja_Id(Long parejaId);

    Optional<EstadoEmocional> findByPareja_IdAndUsuario_Id(Long parejaId, Long usuarioId);
}
