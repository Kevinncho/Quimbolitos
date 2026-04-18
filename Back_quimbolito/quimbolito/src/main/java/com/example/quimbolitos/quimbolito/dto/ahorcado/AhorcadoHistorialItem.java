package com.example.quimbolitos.quimbolito.dto.ahorcado;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AhorcadoHistorialItem {
    private Long id;
    private String estado;
    private String palabra;
    private String pista;
    private LocalDateTime fechaCreacion;
    private Long creadorId;
    private Long adivinadorId;
}
