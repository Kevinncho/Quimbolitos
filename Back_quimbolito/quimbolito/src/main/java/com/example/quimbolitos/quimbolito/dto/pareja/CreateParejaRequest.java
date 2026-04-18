package com.example.quimbolitos.quimbolito.dto.pareja;

import jakarta.validation.constraints.NotNull;
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
public class CreateParejaRequest {

    @NotNull
    private Long usuarioInvitadoId;
}
