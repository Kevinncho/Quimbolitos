package com.example.quimbolitos.quimbolito.dto.subtema;

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
public class SubtemaResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private String icono;
    private Long temaId;
    private String temaNombre;
}
