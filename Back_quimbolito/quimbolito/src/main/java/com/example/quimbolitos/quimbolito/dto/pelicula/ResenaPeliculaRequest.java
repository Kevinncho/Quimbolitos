package com.example.quimbolitos.quimbolito.dto.pelicula;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResenaPeliculaRequest {

    private String comentario;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;
}
