package com.example.quimbolitos.quimbolito.dto.recuerdo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MensajeChatResponse {

    private Long id;
    private String autor;
    private String contenido;
    private LocalDateTime fechaEnvio;
    private Long usuarioId;
    private String usuarioFotoPerfil;
}
