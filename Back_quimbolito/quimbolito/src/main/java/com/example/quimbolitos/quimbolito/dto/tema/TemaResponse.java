package com.example.quimbolitos.quimbolito.dto.tema;

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
public class TemaResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private Long totalSubtemas;
}
