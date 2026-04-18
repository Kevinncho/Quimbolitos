package com.example.quimbolitos.quimbolito.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.ChatRecuerdo;

public interface ChatRecuerdoRepository extends JpaRepository<ChatRecuerdo, Long> {

    Optional<ChatRecuerdo> findByRecuerdo_Id(Long recuerdoId);
}
