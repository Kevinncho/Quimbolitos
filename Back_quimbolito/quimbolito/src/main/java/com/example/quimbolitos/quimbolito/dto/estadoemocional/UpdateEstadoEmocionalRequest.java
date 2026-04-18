package com.example.quimbolitos.quimbolito.dto.estadoemocional;

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
public class UpdateEstadoEmocionalRequest {

    @NotBlank
    @Size(max = 50)
    private String estado;

    @NotBlank
    @Size(max = 20)
    private String emoji;
}
