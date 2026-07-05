package com.example.quimbolitos.quimbolito.dto.pelicula;

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
public class ResenaPeliculaResponse {

    private Long id;
    private String comentario;
    private Integer rating;
    private LocalDateTime fechaActualizacion;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioFotoPerfil;
}
