package com.example.quimbolitos.quimbolito.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.RecuerdoMapa;

public interface RecuerdoMapaRepository extends JpaRepository<RecuerdoMapa, Long> {

    List<RecuerdoMapa> findAllByUsuario_IdOrderByFechaRecuerdoDesc(Long usuarioId);

    List<RecuerdoMapa> findAllByUsuario_IdInOrderByFechaRecuerdoDesc(List<Long> usuarioIds);
}