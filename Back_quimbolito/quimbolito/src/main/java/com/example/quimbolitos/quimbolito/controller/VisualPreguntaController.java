package com.example.quimbolitos.quimbolito.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.quimbolitos.quimbolito.dto.visualpregunta.CreateVisualPreguntaRequest;
import com.example.quimbolitos.quimbolito.dto.visualpregunta.UpdateVisualPreguntaRequest;
import com.example.quimbolitos.quimbolito.dto.visualpregunta.VisualImagenResponse;
import com.example.quimbolitos.quimbolito.dto.visualpregunta.VisualPreguntaResponse;
import com.example.quimbolitos.quimbolito.service.VisualPreguntaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VisualPreguntaController {

    private final VisualPreguntaService visualPreguntaService;

    @PostMapping("/preguntas/{preguntaId}/visual")
    public ResponseEntity<VisualPreguntaResponse> create(@PathVariable Long preguntaId,
                                                         Authentication authentication,
                                                         @Valid @RequestBody CreateVisualPreguntaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(visualPreguntaService.create(preguntaId, authentication, request));
    }

    @GetMapping("/preguntas/{preguntaId}/visual")
    public ResponseEntity<VisualPreguntaResponse> getByPregunta(@PathVariable Long preguntaId,
                                                                 Authentication authentication) {
        return ResponseEntity.ok(visualPreguntaService.findByPreguntaId(preguntaId, authentication));
    }

    @PutMapping("/preguntas/{preguntaId}/visual")
    public ResponseEntity<VisualPreguntaResponse> update(@PathVariable Long preguntaId,
                                                         Authentication authentication,
                                                         @Valid @RequestBody UpdateVisualPreguntaRequest request) {
        return ResponseEntity.ok(visualPreguntaService.update(preguntaId, authentication, request));
    }

    @DeleteMapping("/preguntas/{preguntaId}/visual")
    public ResponseEntity<Void> delete(@PathVariable Long preguntaId, Authentication authentication) {
        visualPreguntaService.delete(preguntaId, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/subtemas/{subtemaId}/visual-preguntas")
    public ResponseEntity<List<VisualPreguntaResponse>> getBySubtema(@PathVariable Long subtemaId,
                                                                     Authentication authentication) {
        return ResponseEntity.ok(visualPreguntaService.findAllBySubtema(subtemaId, authentication));
    }

    @PostMapping(value = "/preguntas/visual/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VisualImagenResponse> uploadImagen(Authentication authentication,
                                                             @RequestParam("imagen") MultipartFile imagen) {
        String url = visualPreguntaService.uploadVisualImage(authentication, imagen);
        return ResponseEntity.ok(new VisualImagenResponse(url));
    }
}
