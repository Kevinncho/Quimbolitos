package com.example.quimbolitos.quimbolito.dto.recuerdomapa;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateRecuerdoMapaRequest {

    @NotBlank
    private String titulo;

    private String descripcion;

    @NotNull
    private Double latitud;

    @NotNull
    private Double longitud;

    @NotNull
    private LocalDate fechaRecuerdo;

    private String paisNombre;
    private String ciudadNombre;
}