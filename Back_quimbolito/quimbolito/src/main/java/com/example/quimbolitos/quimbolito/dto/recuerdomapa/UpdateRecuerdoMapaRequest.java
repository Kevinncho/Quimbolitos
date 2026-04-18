package com.example.quimbolitos.quimbolito.dto.recuerdomapa;

import java.time.LocalDate;

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
public class UpdateRecuerdoMapaRequest {

    private String titulo;
    private String descripcion;
    private Double latitud;
    private Double longitud;
    private LocalDate fechaRecuerdo;
    private String paisNombre;
    private String ciudadNombre;
}