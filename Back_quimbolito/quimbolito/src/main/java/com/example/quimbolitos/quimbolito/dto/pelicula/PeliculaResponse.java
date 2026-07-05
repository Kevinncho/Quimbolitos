package com.example.quimbolitos.quimbolito.dto.pelicula;

import java.time.LocalDateTime;
import java.util.List;

import com.example.quimbolitos.quimbolito.entity.GeneroPelicula;

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
public class PeliculaResponse {

    private Long id;
    private String titulo;
    private String descripcion;
    private String linkVer;
    private String fotoUrl;
    private Boolean visto;
    private List<GeneroPelicula> generos;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioFotoPerfil;
    private LocalDateTime fechaCreacion;
    private Double ratingPromedio;
    private Long totalResenas;
}
