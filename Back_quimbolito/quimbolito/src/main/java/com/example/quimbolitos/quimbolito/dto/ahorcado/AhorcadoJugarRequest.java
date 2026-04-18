package com.example.quimbolitos.quimbolito.dto.ahorcado;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AhorcadoJugarRequest {
    @NotBlank
    private String letra;
}
