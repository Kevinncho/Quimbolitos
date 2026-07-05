package com.example.quimbolitos.quimbolito.controller;

import java.util.List;

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

import com.example.quimbolitos.quimbolito.dto.pelicula.PeliculaResponse;
import com.example.quimbolitos.quimbolito.dto.pelicula.ResenaPeliculaRequest;
import com.example.quimbolitos.quimbolito.dto.pelicula.ResenaPeliculaResponse;
import com.example.quimbolitos.quimbolito.service.PeliculaService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/peliculas")
@RequiredArgsConstructor
public class PeliculaController {

    private final PeliculaService peliculaService;

    @GetMapping
    public ResponseEntity<List<PeliculaResponse>> getPeliculas(Authentication authentication) {
        return ResponseEntity.ok(peliculaService.getPeliculas(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PeliculaResponse> getPeliculaById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(peliculaService.getPeliculaById(id, authentication));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PeliculaResponse> createPelicula(Authentication authentication,
                                                           @RequestParam @NotBlank String titulo,
                                                           @RequestParam(required = false) String descripcion,
                                                           @RequestParam @NotBlank String linkVer,
                                                           @RequestParam(required = false) Boolean visto,
                                                           @RequestParam(required = false) List<String> generos,
                                                           @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        return ResponseEntity.ok(peliculaService.createPelicula(authentication, titulo, descripcion, linkVer, visto, generos, imagen));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PeliculaResponse> updatePelicula(@PathVariable Long id,
                                                           Authentication authentication,
                                                           @RequestParam(required = false) String titulo,
                                                           @RequestParam(required = false) String descripcion,
                                                           @RequestParam(required = false) String linkVer,
                                                           @RequestParam(required = false) Boolean visto,
                                                           @RequestParam(required = false) List<String> generos,
                                                           @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        return ResponseEntity.ok(peliculaService.updatePelicula(id, authentication, titulo, descripcion, linkVer, visto, generos, imagen));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePelicula(@PathVariable Long id, Authentication authentication) {
        peliculaService.deletePelicula(id, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/resenas")
    public ResponseEntity<List<ResenaPeliculaResponse>> getResenas(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(peliculaService.getResenas(id, authentication));
    }

    @PutMapping("/{id}/resena")
    public ResponseEntity<ResenaPeliculaResponse> guardarResena(@PathVariable Long id,
                                                                Authentication authentication,
                                                                @Valid @RequestBody ResenaPeliculaRequest request) {
        return ResponseEntity.ok(
                peliculaService.guardarResena(id, request.getComentario(), request.getRating(), authentication)
        );
    }
}
