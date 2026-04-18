package com.example.quimbolitos.quimbolito.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.ahorcado.AhorcadoEstadoResponse;
import com.example.quimbolitos.quimbolito.dto.ahorcado.AhorcadoHistorialItem;
import com.example.quimbolitos.quimbolito.dto.ahorcado.AhorcadoJugarRequest;
import com.example.quimbolitos.quimbolito.dto.ahorcado.AhorcadoStartRequest;
import com.example.quimbolitos.quimbolito.entity.AhorcadoPartida;
import com.example.quimbolitos.quimbolito.entity.EstadoPartidaAhorcado;
import com.example.quimbolitos.quimbolito.entity.Pareja;
import com.example.quimbolitos.quimbolito.repository.AhorcadoPartidaRepository;
import com.example.quimbolitos.quimbolito.websocket.AhorcadoWebSocketHandler;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AhorcadoService {

    private static final int MAX_ERRORES = 6;

    private final AhorcadoPartidaRepository partidaRepository;
    private final AccessService accessService;
    private final AhorcadoWebSocketHandler webSocketHandler;

    @Transactional
    public AhorcadoEstadoResponse iniciarJuego(Authentication authentication, AhorcadoStartRequest request) {
        Pareja pareja = accessService.getActivePareja(authentication);
        var usuario = accessService.getAuthenticatedUser(authentication);

        AhorcadoPartida ultima = partidaRepository.findTopByPareja_IdOrderByFechaCreacionDesc(pareja.getId())
                .orElse(null);
        if (ultima != null && ultima.getEstado() == EstadoPartidaAhorcado.ACTIVA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya hay una partida en curso");
        }

        String palabra = normalizarPalabra(request.getPalabra());
        if (palabra.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La palabra no puede estar vacia");
        }

        var adivinador = pareja.getUsuarioUno().getId().equals(usuario.getId())
                ? pareja.getUsuarioDos()
                : pareja.getUsuarioUno();

        AhorcadoPartida partida = AhorcadoPartida.builder()
                .pareja(pareja)
                .creador(usuario)
                .adivinador(adivinador)
                .palabra(palabra)
                .pista(request.getPista() == null ? "" : request.getPista().trim())
                .letrasUsadas("")
                .errores(0)
                .estado(EstadoPartidaAhorcado.ACTIVA)
                .fechaCreacion(LocalDateTime.now())
                .build();

        AhorcadoEstadoResponse response = toResponse(partidaRepository.save(partida));
        webSocketHandler.broadcastEstado(pareja.getId(), response);
        return response;
    }

    @Transactional(readOnly = true)
    public AhorcadoEstadoResponse getEstado(Authentication authentication) {
        Pareja pareja = accessService.getActivePareja(authentication);
        AhorcadoPartida partida = partidaRepository.findTopByPareja_IdOrderByFechaCreacionDesc(pareja.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay una partida activa"));
        return toResponse(partida);
    }

    @Transactional
    public AhorcadoEstadoResponse jugar(Authentication authentication, AhorcadoJugarRequest request) {
        Pareja pareja = accessService.getActivePareja(authentication);
        var usuario = accessService.getAuthenticatedUser(authentication);
        AhorcadoPartida partida = partidaRepository.findTopByPareja_IdOrderByFechaCreacionDesc(pareja.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay una partida activa"));

        if (partida.getEstado() != EstadoPartidaAhorcado.ACTIVA) {
            return toResponse(partida);
        }

        if (!partida.getAdivinador().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo la persona que adivina puede jugar");
        }

        String letra = request.getLetra() == null ? "" : request.getLetra().trim().toUpperCase(Locale.ROOT);
        if (letra.length() != 1 || letra.charAt(0) < 'A' || letra.charAt(0) > 'Z') {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Letra invalida");
        }

        List<String> usadas = parseLetras(partida.getLetrasUsadas());
        if (usadas.contains(letra)) {
            return toResponse(partida);
        }

        usadas.add(letra);
        partida.setLetrasUsadas(String.join(",", usadas));

        if (!partida.getPalabra().contains(letra)) {
            partida.setErrores(partida.getErrores() + 1);
        }

        EstadoPartidaAhorcado nuevoEstado = evaluarEstado(partida.getPalabra(), usadas, partida.getErrores());
        partida.setEstado(nuevoEstado);

        AhorcadoEstadoResponse response = toResponse(partidaRepository.save(partida));
        webSocketHandler.broadcastEstado(pareja.getId(), response);
        return response;
    }

    private EstadoPartidaAhorcado evaluarEstado(String palabra, List<String> letras, int errores) {
        if (errores >= MAX_ERRORES) {
            return EstadoPartidaAhorcado.PERDIDA;
        }

        Set<String> letrasSet = letras.stream().collect(Collectors.toSet());
        boolean completa = palabra.chars()
                .mapToObj(c -> String.valueOf((char) c))
                .allMatch(letra -> letra.equals(" ") || letrasSet.contains(letra));

        return completa ? EstadoPartidaAhorcado.GANADA : EstadoPartidaAhorcado.ACTIVA;
    }

    @Transactional(readOnly = true)
    public List<AhorcadoHistorialItem> getHistorial(Authentication authentication) {
        Pareja pareja = accessService.getActivePareja(authentication);
        return partidaRepository.findTop10ByPareja_IdOrderByFechaCreacionDesc(pareja.getId())
                .stream()
                .map(partida -> AhorcadoHistorialItem.builder()
                        .id(partida.getId())
                        .estado(partida.getEstado().name())
                        .palabra(partida.getPalabra())
                        .pista(partida.getPista())
                        .fechaCreacion(partida.getFechaCreacion())
                        .creadorId(partida.getCreador().getId())
                        .adivinadorId(partida.getAdivinador().getId())
                        .build())
                .toList();
    }

    @Transactional
    public void borrarHistorial(Authentication authentication) {
        Pareja pareja = accessService.getActivePareja(authentication);
        partidaRepository.deleteByPareja_Id(pareja.getId());
    }

    @Transactional
    public void cancelarPartidaActiva(Authentication authentication) {
        Pareja pareja = accessService.getActivePareja(authentication);
        partidaRepository.deleteByPareja_IdAndEstado(pareja.getId(), EstadoPartidaAhorcado.ACTIVA);
    }

    private AhorcadoEstadoResponse toResponse(AhorcadoPartida partida) {
        List<String> letrasUsadas = parseLetras(partida.getLetrasUsadas());
        List<String> visible = construirVisible(partida.getPalabra(), letrasUsadas);
        boolean terminado = partida.getEstado() != EstadoPartidaAhorcado.ACTIVA;
        boolean gano = partida.getEstado() == EstadoPartidaAhorcado.GANADA;

        return AhorcadoEstadoResponse.builder()
                .id(partida.getId())
                .creadorId(partida.getCreador().getId())
                .adivinadorId(partida.getAdivinador().getId())
                .estado(partida.getEstado().name())
                .pista(partida.getPista())
                .palabraVisible(visible)
                .letrasUsadas(letrasUsadas)
                .errores(partida.getErrores())
                .maxErrores(MAX_ERRORES)
                .terminado(terminado)
                .gano(gano)
                .palabraSecreta(terminado ? partida.getPalabra() : null)
                .build();
    }

    private List<String> construirVisible(String palabra, List<String> letrasUsadas) {
        Set<String> letras = letrasUsadas.stream().collect(Collectors.toSet());
        List<String> visible = new ArrayList<>();
        for (char c : palabra.toCharArray()) {
            String letra = String.valueOf(c);
            if (letra.equals(" ")) {
                visible.add(" ");
            } else if (letras.contains(letra)) {
                visible.add(letra);
            } else {
                visible.add("_");
            }
        }
        return visible;
    }

    private List<String> parseLetras(String letras) {
        if (letras == null || letras.isBlank()) {
            return new ArrayList<>();
        }
        return List.of(letras.split(",")).stream()
                .filter(letra -> !letra.isBlank())
                .map(letra -> letra.toUpperCase(Locale.ROOT))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private String normalizarPalabra(String palabra) {
        return palabra == null ? "" : palabra.trim().toUpperCase(Locale.ROOT);
    }
}
