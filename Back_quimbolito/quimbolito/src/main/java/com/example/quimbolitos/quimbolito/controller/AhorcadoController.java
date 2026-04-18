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

import com.example.quimbolitos.quimbolito.dto.ahorcado.AhorcadoEstadoResponse;
import com.example.quimbolitos.quimbolito.dto.ahorcado.AhorcadoHistorialItem;
import com.example.quimbolitos.quimbolito.dto.ahorcado.AhorcadoJugarRequest;
import com.example.quimbolitos.quimbolito.dto.ahorcado.AhorcadoStartRequest;
import com.example.quimbolitos.quimbolito.service.AhorcadoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/juegos/ahorcado")
@Validated
@RequiredArgsConstructor
public class AhorcadoController {

    private final AhorcadoService ahorcadoService;

    @PostMapping("/iniciar")
    public AhorcadoEstadoResponse iniciar(@Valid @RequestBody AhorcadoStartRequest request,
                                          Authentication authentication) {
        return ahorcadoService.iniciarJuego(authentication, request);
    }

    @GetMapping("/estado")
    public AhorcadoEstadoResponse getEstado(Authentication authentication) {
        return ahorcadoService.getEstado(authentication);
    }

    @PostMapping("/jugar")
    public AhorcadoEstadoResponse jugar(@Valid @RequestBody AhorcadoJugarRequest request,
                                        Authentication authentication) {
        return ahorcadoService.jugar(authentication, request);
    }

    @GetMapping("/historial")
    public List<AhorcadoHistorialItem> historial(Authentication authentication) {
        return ahorcadoService.getHistorial(authentication);
    }

    @DeleteMapping("/historial")
    public ResponseEntity<Void> borrarHistorial(Authentication authentication) {
        ahorcadoService.borrarHistorial(authentication);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/estado")
    public ResponseEntity<Void> cancelarPartidaActiva(Authentication authentication) {
        ahorcadoService.cancelarPartidaActiva(authentication);
        return ResponseEntity.noContent().build();
    }
}
