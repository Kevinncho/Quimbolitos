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

import com.example.quimbolitos.quimbolito.dto.tema.CreateTemaRequest;
import com.example.quimbolitos.quimbolito.dto.tema.TemaResponse;
import com.example.quimbolitos.quimbolito.dto.tema.UpdateTemaRequest;
import com.example.quimbolitos.quimbolito.service.TemaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/temas")
@RequiredArgsConstructor
public class TemaController {

    private final TemaService temaService;

    @PostMapping
    public ResponseEntity<TemaResponse> create(Authentication authentication,
                                               @Valid @RequestBody CreateTemaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(temaService.create(authentication, request));
    }

    @GetMapping
    public ResponseEntity<List<TemaResponse>> getAll(Authentication authentication) {
        return ResponseEntity.ok(temaService.findAll(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TemaResponse> getById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(temaService.findById(id, authentication));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemaResponse> update(@PathVariable Long id,
                                               Authentication authentication,
                                               @Valid @RequestBody UpdateTemaRequest request) {
        return ResponseEntity.ok(temaService.update(id, authentication, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        temaService.delete(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
