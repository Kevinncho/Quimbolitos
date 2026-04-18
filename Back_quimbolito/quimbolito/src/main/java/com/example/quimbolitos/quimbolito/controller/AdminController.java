package com.example.quimbolitos.quimbolito.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.quimbolitos.quimbolito.dto.user.CreateAdminRequest;
import com.example.quimbolitos.quimbolito.dto.user.UpdateUsuarioRequest;
import com.example.quimbolitos.quimbolito.dto.user.UsuarioResponse;
import com.example.quimbolitos.quimbolito.service.AuthService;
import com.example.quimbolitos.quimbolito.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/usuarios")
@RequiredArgsConstructor
public class AdminController {

    private final AuthService authService;
    private final UsuarioService usuarioService;

    @PostMapping("/admin")
    public ResponseEntity<UsuarioResponse> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.createAdmin(request));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> getAllUsers() {
        return ResponseEntity.ok(usuarioService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> updateUserById(@PathVariable Long id,
                                                          @Valid @RequestBody UpdateUsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.updateById(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id) {
        usuarioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
