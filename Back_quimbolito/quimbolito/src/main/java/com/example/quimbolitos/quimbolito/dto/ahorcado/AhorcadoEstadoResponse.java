package com.example.quimbolitos.quimbolito.dto.ahorcado;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AhorcadoEstadoResponse {
    private Long id;
    private Long creadorId;
    private Long adivinadorId;
    private String estado;
    private String pista;
    private List<String> palabraVisible;
    private List<String> letrasUsadas;
    private int errores;
    private int maxErrores;
    private boolean terminado;
    private boolean gano;
    private String palabraSecreta;
}
