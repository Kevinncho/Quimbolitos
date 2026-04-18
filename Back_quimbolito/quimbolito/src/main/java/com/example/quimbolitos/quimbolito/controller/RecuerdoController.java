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

import com.example.quimbolitos.quimbolito.dto.recuerdo.RecuerdoResponse;
import com.example.quimbolitos.quimbolito.dto.recuerdo.MensajeChatRequest;
import com.example.quimbolitos.quimbolito.dto.recuerdo.MensajeChatResponse;
import com.example.quimbolitos.quimbolito.service.ChatRecuerdoService;
import com.example.quimbolitos.quimbolito.service.RecuerdoService;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recuerdos")
@RequiredArgsConstructor
public class RecuerdoController {

    private final RecuerdoService recuerdoService;
    private final ChatRecuerdoService chatRecuerdoService;

    @GetMapping
    public ResponseEntity<List<RecuerdoResponse>> getRecuerdos(Authentication authentication) {
        return ResponseEntity.ok(recuerdoService.getRecuerdos(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecuerdoResponse> getRecuerdoById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(recuerdoService.getRecuerdoById(id, authentication));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RecuerdoResponse> createRecuerdo(Authentication authentication,
                                                           @RequestParam @NotBlank String titulo,
                                                           @RequestParam(required = false) String descripcion,
                                                           @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaRecuerdo,
                                                           @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        return ResponseEntity.ok(recuerdoService.createRecuerdo(authentication, titulo, descripcion, fechaRecuerdo, imagen));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RecuerdoResponse> updateRecuerdo(@PathVariable Long id,
                                                           Authentication authentication,
                                                           @RequestParam(required = false) String titulo,
                                                           @RequestParam(required = false) String descripcion,
                                                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaRecuerdo,
                                                           @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        return ResponseEntity.ok(recuerdoService.updateRecuerdo(id, authentication, titulo, descripcion, fechaRecuerdo, imagen));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecuerdo(@PathVariable Long id, Authentication authentication) {
        recuerdoService.deleteRecuerdo(id, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/mensajes")
    public ResponseEntity<List<MensajeChatResponse>> getMensajes(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(chatRecuerdoService.getMensajes(id, authentication));
    }

    @PostMapping("/{id}/mensajes")
    public ResponseEntity<MensajeChatResponse> createMensaje(@PathVariable Long id,
                                                             Authentication authentication,
                                                             @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody MensajeChatRequest request) {
        return ResponseEntity.ok(chatRecuerdoService.crearMensaje(id, request.getContenido(), authentication));
    }
}
