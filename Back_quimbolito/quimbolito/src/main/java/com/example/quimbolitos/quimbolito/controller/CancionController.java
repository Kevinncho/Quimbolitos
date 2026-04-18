package com.example.quimbolitos.quimbolito.controller;

import java.util.List;

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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.quimbolitos.quimbolito.dto.cancion.CancionResponse;
import com.example.quimbolitos.quimbolito.service.CancionService;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/canciones")
@RequiredArgsConstructor
public class CancionController {

    private final CancionService cancionService;

    @GetMapping
    public ResponseEntity<List<CancionResponse>> getCanciones(Authentication authentication,
                                                             @RequestParam(defaultValue = "fecha") String orden) {
        return ResponseEntity.ok(cancionService.getCanciones(authentication, orden));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CancionResponse> createCancion(Authentication authentication,
                                                         @RequestParam @NotBlank String titulo,
                                                         @RequestParam(required = false) String artista,
                                                         @RequestParam(required = false) String album,
                                                         @RequestParam(required = false) String dedicatoria,
                                                         @RequestParam(value = "imagen", required = false) MultipartFile imagen,
                                                         @RequestParam(value = "audio", required = false) MultipartFile audio) {
        return ResponseEntity.ok(cancionService.createCancion(authentication, titulo, artista, album, dedicatoria, imagen, audio));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CancionResponse> updateCancion(@PathVariable Long id,
                                                         Authentication authentication,
                                                         @RequestParam(required = false) String titulo,
                                                         @RequestParam(required = false) String artista,
                                                         @RequestParam(required = false) String album,
                                                         @RequestParam(required = false) String dedicatoria,
                                                         @RequestParam(value = "imagen", required = false) MultipartFile imagen,
                                                         @RequestParam(value = "audio", required = false) MultipartFile audio) {
        return ResponseEntity.ok(cancionService.updateCancion(id, authentication, titulo, artista, album, dedicatoria, imagen, audio));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCancion(@PathVariable Long id, Authentication authentication) {
        cancionService.deleteCancion(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
