package com.example.quimbolitos.quimbolito.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.Respuesta;

public interface RespuestaRepository extends JpaRepository<Respuesta, Long> {

    List<Respuesta> findAllByPregunta_Id(Long preguntaId);

    Optional<Respuesta> findByPregunta_IdAndUsuario_Id(Long preguntaId, Long usuarioId);

    void deleteAllByPregunta_Id(Long preguntaId);
}
