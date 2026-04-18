package com.example.quimbolitos.quimbolito.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.Pregunta;

public interface PreguntaRepository extends JpaRepository<Pregunta, Long> {

    List<Pregunta> findAllBySubtema_Id(Long subtemaId);
}
