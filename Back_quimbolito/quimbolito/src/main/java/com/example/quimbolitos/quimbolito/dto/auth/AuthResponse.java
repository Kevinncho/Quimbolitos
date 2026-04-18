package com.example.quimbolitos.quimbolito.dto.auth;

import com.example.quimbolitos.quimbolito.dto.user.UsuarioResponse;

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
public class AuthResponse {

    private String token;
    private String tokenType;
    private UsuarioResponse usuario;
}
