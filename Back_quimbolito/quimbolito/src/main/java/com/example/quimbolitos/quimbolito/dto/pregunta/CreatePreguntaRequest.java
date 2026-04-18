package com.example.quimbolitos.quimbolito.dto.pregunta;

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
public class CreatePreguntaRequest {

    @NotBlank
    @Size(max = 300)
    private String enunciado;

    @Size(max = 500)
    private String descripcion;
}
