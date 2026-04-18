package com.example.quimbolitos.quimbolito.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.Subtema;

public interface SubtemaRepository extends JpaRepository<Subtema, Long> {

    List<Subtema> findAllByTema_Id(Long temaId);
}
