package com.example.quimbolitos.quimbolito.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.MensajeChat;

public interface MensajeChatRepository extends JpaRepository<MensajeChat, Long> {

    List<MensajeChat> findAllByChat_IdOrderByFechaEnvioAsc(Long chatId);

    long countByChat_Recuerdo_Id(Long recuerdoId);
}
