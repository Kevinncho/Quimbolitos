package com.example.quimbolitos.quimbolito.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import com.example.quimbolitos.quimbolito.entity.EstadoPartidaTresEnRaya;
import com.example.quimbolitos.quimbolito.entity.TresEnRayaPartida;

public interface TresEnRayaPartidaRepository extends JpaRepository<TresEnRayaPartida, Long> {
    Optional<TresEnRayaPartida> findTopByPareja_IdOrderByFechaCreacionDesc(Long parejaId);

    @Modifying
    void deleteByPareja_IdAndEstado(Long parejaId, EstadoPartidaTresEnRaya estado);
}
