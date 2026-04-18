package com.example.quimbolitos.quimbolito.dto.tema;

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
public class UpdateTemaRequest {

    @Size(max = 100)
    private String nombre;

    @Size(max = 300)
    private String descripcion;
}
