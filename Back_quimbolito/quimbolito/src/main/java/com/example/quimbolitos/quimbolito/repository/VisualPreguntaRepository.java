package com.example.quimbolitos.quimbolito.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.VisualPregunta;

public interface VisualPreguntaRepository extends JpaRepository<VisualPregunta, Long> {

    Optional<VisualPregunta> findByPregunta_Id(Long preguntaId);

    List<VisualPregunta> findAllByPregunta_Subtema_Id(Long subtemaId);

    void deleteByPregunta_Id(Long preguntaId);
}
