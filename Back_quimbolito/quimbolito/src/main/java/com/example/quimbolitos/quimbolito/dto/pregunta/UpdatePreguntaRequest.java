package com.example.quimbolitos.quimbolito.dto.pregunta;

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
public class UpdatePreguntaRequest {

    private String enunciado;
    private String descripcion;
    private Boolean activa;
}
