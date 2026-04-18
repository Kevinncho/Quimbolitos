package com.example.quimbolitos.quimbolito.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.Recuerdo;

public interface RecuerdoRepository extends JpaRepository<Recuerdo, Long> {

    List<Recuerdo> findAllByUsuario_IdOrderByFechaRecuerdoDesc(Long usuarioId);

    List<Recuerdo> findAllByUsuario_IdInOrderByFechaRecuerdoDesc(List<Long> usuarioIds);
}
