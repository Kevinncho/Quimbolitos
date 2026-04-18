package com.example.quimbolitos.quimbolito.dto.estadoemocional;

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
public class EstadoEmocionalResponse {

    private Long id;
    private Long parejaId;
    private Long usuarioId;
    private String usuarioNombre;
    private String estado;
    private String emoji;
    private LocalDateTime fechaActualizacion;
}
