package com.example.quimbolitos.quimbolito.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import com.example.quimbolitos.quimbolito.entity.AhorcadoPartida;

import com.example.quimbolitos.quimbolito.entity.EstadoPartidaAhorcado;

public interface AhorcadoPartidaRepository extends JpaRepository<AhorcadoPartida, Long> {
    Optional<AhorcadoPartida> findTopByPareja_IdOrderByFechaCreacionDesc(Long parejaId);
    List<AhorcadoPartida> findTop10ByPareja_IdOrderByFechaCreacionDesc(Long parejaId);
    
    @Modifying
    void deleteByPareja_IdAndEstadoNot(Long parejaId, EstadoPartidaAhorcado estado);

    @Modifying
    void deleteByPareja_IdAndEstado(Long parejaId, EstadoPartidaAhorcado estado);

    @Modifying
    void deleteByPareja_Id(Long parejaId);
}
