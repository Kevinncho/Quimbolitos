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

import com.example.quimbolitos.quimbolito.dto.subtema.CreateSubtemaRequest;
import com.example.quimbolitos.quimbolito.dto.subtema.SubtemaResponse;
import com.example.quimbolitos.quimbolito.dto.subtema.UpdateSubtemaRequest;
import com.example.quimbolitos.quimbolito.service.SubtemaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SubtemaController {

    private final SubtemaService subtemaService;

    @PostMapping("/temas/{temaId}/subtemas")
    public ResponseEntity<SubtemaResponse> create(@PathVariable Long temaId,
                                                  Authentication authentication,
                                                  @Valid @RequestBody CreateSubtemaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subtemaService.create(temaId, authentication, request));
    }

    @GetMapping("/temas/{temaId}/subtemas")
    public ResponseEntity<List<SubtemaResponse>> getAllByTema(@PathVariable Long temaId,
                                                              Authentication authentication) {
        return ResponseEntity.ok(subtemaService.findAllByTema(temaId, authentication));
    }

    @GetMapping("/subtemas/{id}")
    public ResponseEntity<SubtemaResponse> getById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(subtemaService.findById(id, authentication));
    }

    @PutMapping("/subtemas/{id}")
    public ResponseEntity<SubtemaResponse> update(@PathVariable Long id,
                                                  Authentication authentication,
                                                  @Valid @RequestBody UpdateSubtemaRequest request) {
        return ResponseEntity.ok(subtemaService.update(id, authentication, request));
    }

    @DeleteMapping("/subtemas/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        subtemaService.delete(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
