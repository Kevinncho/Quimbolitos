package com.example.quimbolitos.quimbolito.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.example.quimbolitos.quimbolito.dto.user.UpdateUsuarioRequest;
import com.example.quimbolitos.quimbolito.dto.user.UsuarioResponse;
import com.example.quimbolitos.quimbolito.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(usuarioService.getProfile(authentication));
    }

    @GetMapping("/buscar")
    public ResponseEntity<UsuarioResponse> findByEmail(@RequestParam String email, Authentication authentication) {
        return ResponseEntity.ok(usuarioService.findByEmail(email, authentication));
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioResponse> updateProfile(Authentication authentication,
                                                         @Valid @RequestBody UpdateUsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.updateMyProfile(authentication, request));
    }

    @PostMapping(value = "/me/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UsuarioResponse> uploadProfilePhoto(Authentication authentication,
                                                              @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(usuarioService.updateMyProfilePhoto(authentication, file));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteProfile(Authentication authentication) {
        usuarioService.deleteMyProfile(authentication);
        return ResponseEntity.noContent().build();
    }
}
