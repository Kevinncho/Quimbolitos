package com.example.quimbolitos.quimbolito.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.quimbolitos.quimbolito.dto.pareja.CreateParejaRequest;
import com.example.quimbolitos.quimbolito.dto.pareja.ParejaResponse;
import com.example.quimbolitos.quimbolito.service.ParejaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/parejas")
@RequiredArgsConstructor
public class ParejaController {

    private final ParejaService parejaService;

    @PostMapping
    public ResponseEntity<ParejaResponse> createInvitation(Authentication authentication,
                                                           @Valid @RequestBody CreateParejaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(parejaService.createInvitation(authentication, request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ParejaResponse>> getMyPairs(Authentication authentication) {
        return ResponseEntity.ok(parejaService.getMyPairs(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParejaResponse> getById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(parejaService.getById(id, authentication));
    }

    @PostMapping("/{id}/aceptar")
    public ResponseEntity<ParejaResponse> accept(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(parejaService.acceptInvitation(id, authentication));
    }

    @PostMapping("/{id}/rechazar")
    public ResponseEntity<ParejaResponse> reject(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(parejaService.rejectInvitation(id, authentication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        parejaService.deletePair(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
