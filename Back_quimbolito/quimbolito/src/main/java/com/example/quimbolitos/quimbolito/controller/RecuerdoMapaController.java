package com.example.quimbolitos.quimbolito.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;

import com.example.quimbolitos.quimbolito.dto.recuerdomapa.RecuerdoMapaResponse;
import com.example.quimbolitos.quimbolito.dto.recuerdomapa.CreateRecuerdoMapaRequest;
import com.example.quimbolitos.quimbolito.dto.recuerdomapa.UpdateRecuerdoMapaRequest;
import com.example.quimbolitos.quimbolito.service.RecuerdoMapaService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recuerdos-mapa")
@RequiredArgsConstructor
public class RecuerdoMapaController {

    private final RecuerdoMapaService recuerdoMapaService;

    @GetMapping
    public ResponseEntity<List<RecuerdoMapaResponse>> getRecuerdosMapa(Authentication authentication) {
        return ResponseEntity.ok(recuerdoMapaService.getRecuerdosMapa(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecuerdoMapaResponse> getRecuerdoMapaById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(recuerdoMapaService.getRecuerdoMapaById(id, authentication));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RecuerdoMapaResponse> createRecuerdoMapa(Authentication authentication,
                                                                   @RequestParam @NotBlank String titulo,
                                                                   @RequestParam(required = false) String descripcion,
                                                                   @RequestParam @NotNull Double latitud,
                                                                   @RequestParam @NotNull Double longitud,
                                                                   @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaRecuerdo,
                                                                   @RequestParam(required = false) String paisNombre,
                                                                   @RequestParam(required = false) String ciudadNombre,
                                                                   @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        CreateRecuerdoMapaRequest request = CreateRecuerdoMapaRequest.builder()
                .titulo(titulo)
                .descripcion(descripcion)
                .latitud(latitud)
                .longitud(longitud)
                .fechaRecuerdo(fechaRecuerdo)
                .paisNombre(paisNombre)
                .ciudadNombre(ciudadNombre)
                .build();

        return ResponseEntity.ok(recuerdoMapaService.createRecuerdoMapa(authentication, request, imagen));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RecuerdoMapaResponse> updateRecuerdoMapa(@PathVariable Long id,
                                                                   Authentication authentication,
                                                                   @RequestParam(required = false) String titulo,
                                                                   @RequestParam(required = false) String descripcion,
                                                                   @RequestParam(required = false) Double latitud,
                                                                   @RequestParam(required = false) Double longitud,
                                                                   @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaRecuerdo,
                                                                   @RequestParam(required = false) String paisNombre,
                                                                   @RequestParam(required = false) String ciudadNombre,
                                                                   @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        UpdateRecuerdoMapaRequest request = UpdateRecuerdoMapaRequest.builder()
                .titulo(titulo)
                .descripcion(descripcion)
                .latitud(latitud)
                .longitud(longitud)
                .fechaRecuerdo(fechaRecuerdo)
                .paisNombre(paisNombre)
                .ciudadNombre(ciudadNombre)
                .build();

        return ResponseEntity.ok(recuerdoMapaService.updateRecuerdoMapa(id, authentication, request, imagen));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecuerdoMapa(@PathVariable Long id, Authentication authentication) {
        recuerdoMapaService.deleteRecuerdoMapa(id, authentication);
        return ResponseEntity.noContent().build();
    }
}