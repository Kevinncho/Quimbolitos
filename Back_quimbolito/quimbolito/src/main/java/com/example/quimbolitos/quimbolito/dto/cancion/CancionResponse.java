package com.example.quimbolitos.quimbolito.dto.cancion;

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
public class CancionResponse {

    private Long id;
    private String titulo;
    private String artista;
    private String album;
    private String url;
    private String audioUrl;
    private String dedicatoria;
    private Long usuarioId;
    private String usuarioNombre;
}
