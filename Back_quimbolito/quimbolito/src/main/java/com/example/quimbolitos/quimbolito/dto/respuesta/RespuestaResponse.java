package com.example.quimbolitos.quimbolito.dto.respuesta;

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
public class RespuestaResponse {

    private Long id;
    private String contenido;
    private LocalDateTime fechaRespuesta;
    private Long preguntaId;
    private String preguntaEnunciado;
    private Long usuarioId;
    private String usuarioNombre;
}
