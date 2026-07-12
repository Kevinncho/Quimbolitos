package com.example.quimbolitos.quimbolito.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.tresenraya.TresEnRayaEstadoResponse;
import com.example.quimbolitos.quimbolito.entity.EstadoPartidaTresEnRaya;
import com.example.quimbolitos.quimbolito.entity.Pareja;
import com.example.quimbolitos.quimbolito.entity.TresEnRayaPartida;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.TresEnRayaPartidaRepository;
import com.example.quimbolitos.quimbolito.websocket.TresEnRayaWebSocketHandler;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TresEnRayaService {

    private static final String EMPTY_BOARD = "---------";
    private static final int[][] WINNING_LINES = {
            {0, 1, 2},
            {3, 4, 5},
            {6, 7, 8},
            {0, 3, 6},
            {1, 4, 7},
            {2, 5, 8},
            {0, 4, 8},
            {2, 4, 6}
    };

    private final TresEnRayaPartidaRepository partidaRepository;
    private final AccessService accessService;
    private final TresEnRayaWebSocketHandler webSocketHandler;

    @Transactional
    public TresEnRayaEstadoResponse iniciarJuego(Authentication authentication) {
        Pareja pareja = accessService.getActivePareja(authentication);
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        TresEnRayaPartida ultima = partidaRepository.findTopByPareja_IdOrderByFechaCreacionDesc(pareja.getId())
                .orElse(null);
        if (ultima != null && ultima.getEstado() == EstadoPartidaTresEnRaya.ACTIVA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya hay una partida de tres en raya en curso");
        }

        Usuario jugadorO = pareja.getUsuarioUno().getId().equals(usuario.getId())
                ? pareja.getUsuarioDos()
                : pareja.getUsuarioUno();

        LocalDateTime now = LocalDateTime.now();
        TresEnRayaPartida partida = TresEnRayaPartida.builder()
                .pareja(pareja)
                .jugadorX(usuario)
                .jugadorO(jugadorO)
                .tablero(EMPTY_BOARD)
                .turnoActual("X")
                .marcadorX(0)
                .marcadorO(0)
                .empates(0)
                .rondasJugadas(0)
                .estado(EstadoPartidaTresEnRaya.ACTIVA)
                .fechaCreacion(now)
                .fechaActualizacion(now)
                .build();

        TresEnRayaEstadoResponse response = toResponse(partidaRepository.save(partida));
        webSocketHandler.broadcastEstado(pareja.getId(), response);
        return response;
    }

    @Transactional(readOnly = true)
    public TresEnRayaEstadoResponse getEstado(Authentication authentication) {
        Pareja pareja = accessService.getActivePareja(authentication);
        TresEnRayaPartida partida = partidaRepository.findTopByPareja_IdOrderByFechaCreacionDesc(pareja.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay una partida activa de tres en raya"));
        return toResponse(partida);
    }

    @Transactional
    public TresEnRayaEstadoResponse jugar(Authentication authentication, Integer posicion) {
        Pareja pareja = accessService.getActivePareja(authentication);
        Usuario usuario = accessService.getAuthenticatedUser(authentication);
        TresEnRayaPartida partida = partidaRepository.findTopByPareja_IdOrderByFechaCreacionDesc(pareja.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay una partida activa de tres en raya"));

        if (partida.getEstado() != EstadoPartidaTresEnRaya.ACTIVA) {
            return toResponse(partida);
        }

        if (posicion == null || posicion < 0 || posicion > 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Posicion invalida");
        }

        validateTurn(partida, usuario);

        char[] board = partida.getTablero().toCharArray();
        if (board[posicion] != '-') {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esa casilla ya esta ocupada");
        }

        char simbolo = partida.getTurnoActual().charAt(0);
        board[posicion] = simbolo;
        partida.setTablero(new String(board));
        partida.setFechaActualizacion(LocalDateTime.now());

        int[] winningLine = getWinningLine(board);
        if (winningLine != null) {
            if (simbolo == 'X') {
                partida.setEstado(EstadoPartidaTresEnRaya.X_GANA);
                partida.setMarcadorX(partida.getMarcadorX() + 1);
            } else {
                partida.setEstado(EstadoPartidaTresEnRaya.O_GANA);
                partida.setMarcadorO(partida.getMarcadorO() + 1);
            }
            partida.setRondasJugadas(partida.getRondasJugadas() + 1);
        } else if (isBoardFull(board)) {
            partida.setEstado(EstadoPartidaTresEnRaya.EMPATE);
            partida.setEmpates(partida.getEmpates() + 1);
            partida.setRondasJugadas(partida.getRondasJugadas() + 1);
        } else {
            partida.setTurnoActual(simbolo == 'X' ? "O" : "X");
        }

        TresEnRayaEstadoResponse response = toResponse(partidaRepository.save(partida));
        webSocketHandler.broadcastEstado(pareja.getId(), response);
        return response;
    }

    @Transactional
    public TresEnRayaEstadoResponse nuevaRonda(Authentication authentication) {
        Pareja pareja = accessService.getActivePareja(authentication);
        accessService.getAuthenticatedUser(authentication);
        TresEnRayaPartida partida = partidaRepository.findTopByPareja_IdOrderByFechaCreacionDesc(pareja.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay una partida activa de tres en raya"));

        if (partida.getEstado() == EstadoPartidaTresEnRaya.ACTIVA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La ronda actual aun no termina");
        }

        partida.setTablero(EMPTY_BOARD);
        partida.setEstado(EstadoPartidaTresEnRaya.ACTIVA);
        partida.setTurnoActual(partida.getRondasJugadas() % 2 == 0 ? "X" : "O");
        partida.setFechaActualizacion(LocalDateTime.now());

        TresEnRayaEstadoResponse response = toResponse(partidaRepository.save(partida));
        webSocketHandler.broadcastEstado(pareja.getId(), response);
        return response;
    }

    @Transactional
    public TresEnRayaEstadoResponse reiniciarSerie(Authentication authentication) {
        Pareja pareja = accessService.getActivePareja(authentication);
        accessService.getAuthenticatedUser(authentication);
        TresEnRayaPartida partida = partidaRepository.findTopByPareja_IdOrderByFechaCreacionDesc(pareja.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay una partida activa de tres en raya"));

        partida.setTablero(EMPTY_BOARD);
        partida.setTurnoActual("X");
        partida.setMarcadorX(0);
        partida.setMarcadorO(0);
        partida.setEmpates(0);
        partida.setRondasJugadas(0);
        partida.setEstado(EstadoPartidaTresEnRaya.ACTIVA);
        partida.setFechaActualizacion(LocalDateTime.now());

        TresEnRayaEstadoResponse response = toResponse(partidaRepository.save(partida));
        webSocketHandler.broadcastEstado(pareja.getId(), response);
        return response;
    }

    @Transactional
    public void cancelarPartidaActiva(Authentication authentication) {
        Pareja pareja = accessService.getActivePareja(authentication);
        partidaRepository.deleteByPareja_IdAndEstado(pareja.getId(), EstadoPartidaTresEnRaya.ACTIVA);
        webSocketHandler.broadcastCancelacion(pareja.getId());
    }

    private void validateTurn(TresEnRayaPartida partida, Usuario usuario) {
        Long turnoJugadorId = resolveTurnPlayerId(partida);
        if (!turnoJugadorId.equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No es tu turno en esta partida");
        }
    }

    private TresEnRayaEstadoResponse toResponse(TresEnRayaPartida partida) {
        char[] board = partida.getTablero().toCharArray();
        int[] winningLine = getWinningLine(board);
        boolean terminado = partida.getEstado() != EstadoPartidaTresEnRaya.ACTIVA;
        Usuario jugadorO = resolveJugadorO(partida);
        String ganador = switch (partida.getEstado()) {
            case X_GANA -> "X";
            case O_GANA -> "O";
            default -> null;
        };

        return TresEnRayaEstadoResponse.builder()
                .id(partida.getId())
                .jugadorXId(partida.getJugadorX().getId())
                .jugadorOId(jugadorO.getId())
                .turnoJugadorId(resolveTurnPlayerId(partida))
                .simboloTurno(partida.getTurnoActual())
                .estado(partida.getEstado().name())
                .ganador(ganador)
                .tablero(toBoardResponse(board))
                .winningCells(toWinningCells(winningLine))
                .marcadorX(partida.getMarcadorX())
                .marcadorO(partida.getMarcadorO())
                .empates(partida.getEmpates())
                .rondasJugadas(partida.getRondasJugadas())
                .terminado(terminado)
                .build();
    }

    private Long resolveTurnPlayerId(TresEnRayaPartida partida) {
        if ("X".equals(partida.getTurnoActual())) {
            return partida.getJugadorX().getId();
        }
        return resolveJugadorO(partida).getId();
    }

    private Usuario resolveJugadorO(TresEnRayaPartida partida) {
        Long jugadorXId = partida.getJugadorX().getId();
        if (!partida.getPareja().getUsuarioUno().getId().equals(jugadorXId)) {
            return partida.getPareja().getUsuarioUno();
        }
        return partida.getPareja().getUsuarioDos();
    }

    private List<String> toBoardResponse(char[] board) {
        List<String> values = new ArrayList<>(board.length);
        for (char cell : board) {
            values.add(cell == '-' ? "" : String.valueOf(cell));
        }
        return values;
    }

    private List<Integer> toWinningCells(int[] winningLine) {
        if (winningLine == null) {
            return List.of();
        }
        List<Integer> cells = new ArrayList<>(winningLine.length);
        for (int cell : winningLine) {
            cells.add(cell);
        }
        return cells;
    }

    private int[] getWinningLine(char[] board) {
        for (int[] line : WINNING_LINES) {
            char first = board[line[0]];
            if (first == '-') {
                continue;
            }
            if (first == board[line[1]] && first == board[line[2]]) {
                return line;
            }
        }
        return null;
    }

    private boolean isBoardFull(char[] board) {
        for (char cell : board) {
            if (cell == '-') {
                return false;
            }
        }
        return true;
    }
}
