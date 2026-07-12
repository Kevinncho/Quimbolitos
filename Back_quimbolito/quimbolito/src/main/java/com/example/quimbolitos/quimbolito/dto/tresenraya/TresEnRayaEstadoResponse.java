package com.example.quimbolitos.quimbolito.dto.tresenraya;

import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TresEnRayaEstadoResponse {
    Long id;
    Long jugadorXId;
    Long jugadorOId;
    Long turnoJugadorId;
    String simboloTurno;
    String estado;
    String ganador;
    List<String> tablero;
    List<Integer> winningCells;
    Integer marcadorX;
    Integer marcadorO;
    Integer empates;
    Integer rondasJugadas;
    boolean terminado;
}
