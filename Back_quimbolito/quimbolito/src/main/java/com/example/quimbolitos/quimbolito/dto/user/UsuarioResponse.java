package com.example.quimbolitos.quimbolito.dto.user;

import java.time.LocalDate;

import com.example.quimbolitos.quimbolito.entity.RolUsuario;

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
public class UsuarioResponse {

    private Long id;
    private String nombre;
    private String alias;
    private String email;
    private RolUsuario rol;
    private String fotoPerfil;
    private LocalDate fechaNacimiento;
    private String biografia;
}
