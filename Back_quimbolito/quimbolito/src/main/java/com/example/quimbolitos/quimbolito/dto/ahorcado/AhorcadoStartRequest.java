package com.example.quimbolitos.quimbolito.dto.ahorcado;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AhorcadoStartRequest {
    @NotBlank
    private String palabra;
    private String pista;
}
