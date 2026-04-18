package com.example.quimbolitos.quimbolito.dto.respuesta;

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
public class CreateRespuestaRequest {

    @NotBlank
    @Size(max = 1000)
    private String contenido;
}
