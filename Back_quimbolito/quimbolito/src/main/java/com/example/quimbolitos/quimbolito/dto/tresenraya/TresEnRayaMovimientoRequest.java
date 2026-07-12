package com.example.quimbolitos.quimbolito.dto.tresenraya;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TresEnRayaMovimientoRequest {
    @NotNull
    @Min(0)
    @Max(8)
    private Integer posicion;
}
