package com.example.quimbolitos.quimbolito.dto.subtema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class CreateSubtemaRequest {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @Size(max = 300)
    private String descripcion;

    @Size(max = 100)
    private String icono;
}
