package com.example.quimbolitos.quimbolito.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.Tema;

public interface TemaRepository extends JpaRepository<Tema, Long> {

    List<Tema> findAllByPareja_Id(Long parejaId);
}
