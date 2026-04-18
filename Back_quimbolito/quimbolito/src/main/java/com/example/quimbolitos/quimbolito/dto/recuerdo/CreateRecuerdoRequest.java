package com.example.quimbolitos.quimbolito.dto.recuerdo;

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
public class CreateRecuerdoRequest {

    @NotBlank
    private String titulo;

    private String descripcion;

    @NotNull
    private LocalDate fechaRecuerdo;
}
