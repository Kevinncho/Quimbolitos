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

import com.example.quimbolitos.quimbolito.dto.pregunta.CreatePreguntaRequest;
import com.example.quimbolitos.quimbolito.dto.pregunta.PreguntaResponse;
import com.example.quimbolitos.quimbolito.dto.pregunta.UpdatePreguntaRequest;
import com.example.quimbolitos.quimbolito.service.PreguntaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PreguntaController {

    private final PreguntaService preguntaService;

    @PostMapping("/subtemas/{subtemaId}/preguntas")
    public ResponseEntity<PreguntaResponse> create(@PathVariable Long subtemaId,
                                                   Authentication authentication,
                                                   @Valid @RequestBody CreatePreguntaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(preguntaService.create(subtemaId, authentication, request));
    }

    @GetMapping("/subtemas/{subtemaId}/preguntas")
    public ResponseEntity<List<PreguntaResponse>> getAllBySubtema(@PathVariable Long subtemaId,
                                                                  Authentication authentication) {
        return ResponseEntity.ok(preguntaService.findAllBySubtema(subtemaId, authentication));
    }

    @GetMapping("/preguntas/{id}")
    public ResponseEntity<PreguntaResponse> getById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(preguntaService.findById(id, authentication));
    }

    @PutMapping("/preguntas/{id}")
    public ResponseEntity<PreguntaResponse> update(@PathVariable Long id,
                                                   Authentication authentication,
                                                   @Valid @RequestBody UpdatePreguntaRequest request) {
        return ResponseEntity.ok(preguntaService.update(id, authentication, request));
    }

    @DeleteMapping("/preguntas/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        preguntaService.delete(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
