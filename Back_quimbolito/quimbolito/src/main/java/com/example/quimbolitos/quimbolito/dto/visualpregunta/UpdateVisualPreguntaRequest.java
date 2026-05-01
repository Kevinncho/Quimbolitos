package com.example.quimbolitos.quimbolito.dto.visualpregunta;

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
public class UpdateVisualPreguntaRequest {

    @Size(max = 200)
    private String opcionALabel;

    @Size(max = 500)
    private String opcionASrc;

    @Size(max = 300)
    private String opcionAAlt;

    private Integer opcionAPositionY;

    @Size(max = 200)
    private String opcionBLabel;

    @Size(max = 500)
    private String opcionBSrc;

    @Size(max = 300)
    private String opcionBAlt;

    private Integer opcionBPositionY;
}
