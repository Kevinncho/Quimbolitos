package com.example.quimbolitos.quimbolito.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.quimbolitos.quimbolito.entity.Pareja;

public interface ParejaRepository extends JpaRepository<Pareja, Long> {

    List<Pareja> findAllByUsuarioUno_IdOrUsuarioDos_Id(Long usuarioUnoId, Long usuarioDosId);
}
