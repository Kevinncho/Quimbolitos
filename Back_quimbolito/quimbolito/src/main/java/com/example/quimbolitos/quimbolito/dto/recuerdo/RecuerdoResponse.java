package com.example.quimbolitos.quimbolito.dto.recuerdo;

import java.time.LocalDate;

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
public class RecuerdoResponse {

    private Long id;
    private String titulo;
    private String descripcion;
    private LocalDate fechaRecuerdo;
    private String fotoUrl;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioFotoPerfil;
    private Long mensajesCount;
}
