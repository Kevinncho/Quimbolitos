package com.example.quimbolitos.quimbolito.dto.visualpregunta;

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
public class VisualPreguntaResponse {

    private Long id;
    private Long preguntaId;
    private String opcionALabel;
    private String opcionASrc;
    private String opcionAAlt;
    private String opcionBLabel;
    private String opcionBSrc;
    private String opcionBAlt;
}
