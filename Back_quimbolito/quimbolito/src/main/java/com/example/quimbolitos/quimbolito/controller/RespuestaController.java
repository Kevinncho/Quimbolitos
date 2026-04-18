package com.example.quimbolitos.quimbolito.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.quimbolitos.quimbolito.dto.respuesta.CreateRespuestaRequest;
import com.example.quimbolitos.quimbolito.dto.respuesta.RespuestaResponse;
import com.example.quimbolitos.quimbolito.dto.respuesta.UpdateRespuestaRequest;
import com.example.quimbolitos.quimbolito.service.RespuestaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RespuestaController {

    private final RespuestaService respuestaService;

    @PostMapping("/preguntas/{preguntaId}/respuestas")
    public ResponseEntity<RespuestaResponse> create(@PathVariable Long preguntaId,
                                                    Authentication authentication,
                                                    @Valid @RequestBody CreateRespuestaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(respuestaService.create(preguntaId, authentication, request));
    }

    @GetMapping("/preguntas/{preguntaId}/respuestas")
    public ResponseEntity<List<RespuestaResponse>> getAllByPregunta(@PathVariable Long preguntaId,
                                                                    Authentication authentication) {
        return ResponseEntity.ok(respuestaService.findAllByPregunta(preguntaId, authentication));
    }

    @GetMapping("/respuestas/{id}")
    public ResponseEntity<RespuestaResponse> getById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(respuestaService.findById(id, authentication));
    }

    @PutMapping("/respuestas/{id}")
    public ResponseEntity<RespuestaResponse> update(@PathVariable Long id,
                                                    Authentication authentication,
                                                    @Valid @RequestBody UpdateRespuestaRequest request) {
        return ResponseEntity.ok(respuestaService.update(id, authentication, request));
    }

    @DeleteMapping("/respuestas/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        respuestaService.delete(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
