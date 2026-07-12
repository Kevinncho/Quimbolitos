package com.example.quimbolitos.quimbolito.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.quimbolitos.quimbolito.dto.tresenraya.TresEnRayaEstadoResponse;
import com.example.quimbolitos.quimbolito.dto.tresenraya.TresEnRayaMovimientoRequest;
import com.example.quimbolitos.quimbolito.service.TresEnRayaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/juegos/tres-en-raya")
@Validated
@RequiredArgsConstructor
public class TresEnRayaController {

    private final TresEnRayaService tresEnRayaService;

    @PostMapping("/iniciar")
    public TresEnRayaEstadoResponse iniciar(Authentication authentication) {
        return tresEnRayaService.iniciarJuego(authentication);
    }

    @GetMapping("/estado")
    public TresEnRayaEstadoResponse estado(Authentication authentication) {
        return tresEnRayaService.getEstado(authentication);
    }

    @PostMapping("/jugar")
    public TresEnRayaEstadoResponse jugar(@Valid @RequestBody TresEnRayaMovimientoRequest request,
                                          Authentication authentication) {
        return tresEnRayaService.jugar(authentication, request.getPosicion());
    }

    @PostMapping("/nueva-ronda")
    public TresEnRayaEstadoResponse nuevaRonda(Authentication authentication) {
        return tresEnRayaService.nuevaRonda(authentication);
    }

    @PostMapping("/reiniciar-serie")
    public TresEnRayaEstadoResponse reiniciarSerie(Authentication authentication) {
        return tresEnRayaService.reiniciarSerie(authentication);
    }

    @DeleteMapping("/estado")
    public ResponseEntity<Void> cancelar(Authentication authentication) {
        tresEnRayaService.cancelarPartidaActiva(authentication);
        return ResponseEntity.noContent().build();
    }
}
