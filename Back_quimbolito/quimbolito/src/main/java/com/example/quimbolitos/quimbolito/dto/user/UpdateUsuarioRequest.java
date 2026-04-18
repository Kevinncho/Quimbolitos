package com.example.quimbolitos.quimbolito.dto.user;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
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
public class UpdateUsuarioRequest {

    @Size(max = 80)
    private String nombre;

    @Size(max = 80)
    private String alias;

    @Email
    @Size(max = 120)
    private String email;

    @Size(min = 6, max = 100)
    private String password;

    private LocalDate fechaNacimiento;

    @Size(max = 500)
    private String biografia;

    @Size(max = 255)
    private String fotoPerfil;
}
