package com.example.quimbolitos.quimbolito.dto.pareja;

import java.time.LocalDateTime;

import com.example.quimbolitos.quimbolito.entity.EstadoPareja;

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
public class ParejaResponse {

    private Long id;
    private EstadoPareja estado;
    private String codigoInvitacion;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaRespuesta;
    private Long usuarioUnoId;
    private String usuarioUnoNombre;
    private String usuarioUnoFotoPerfil;
    private Double usuarioUnoLatitud;
    private Double usuarioUnoLongitud;
    private Long usuarioDosId;
    private String usuarioDosNombre;
    private String usuarioDosFotoPerfil;
    private Double usuarioDosLatitud;
    private Double usuarioDosLongitud;
}
