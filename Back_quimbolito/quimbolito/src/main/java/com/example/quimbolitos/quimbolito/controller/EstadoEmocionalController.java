package com.example.quimbolitos.quimbolito.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.quimbolitos.quimbolito.dto.estadoemocional.EstadoEmocionalResponse;
import com.example.quimbolitos.quimbolito.dto.estadoemocional.UpdateEstadoEmocionalRequest;
import com.example.quimbolitos.quimbolito.service.EstadoEmocionalService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/estados-emocionales")
@RequiredArgsConstructor
public class EstadoEmocionalController {

    private final EstadoEmocionalService estadoEmocionalService;

    @GetMapping("/pareja")
    public ResponseEntity<List<EstadoEmocionalResponse>> getEstadosDeMiPareja(Authentication authentication) {
        return ResponseEntity.ok(estadoEmocionalService.getEstadosDeMiPareja(authentication));
    }

    @PutMapping("/me")
    public ResponseEntity<EstadoEmocionalResponse> updateMiEstado(Authentication authentication,
                                                                  @Valid @RequestBody UpdateEstadoEmocionalRequest request) {
        return ResponseEntity.ok(estadoEmocionalService.updateMiEstado(authentication, request));
    }
}
