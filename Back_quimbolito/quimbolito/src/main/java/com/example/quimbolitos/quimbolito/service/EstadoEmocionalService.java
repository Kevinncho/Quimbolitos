package com.example.quimbolitos.quimbolito.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.quimbolitos.quimbolito.dto.estadoemocional.EstadoEmocionalResponse;
import com.example.quimbolitos.quimbolito.dto.estadoemocional.UpdateEstadoEmocionalRequest;
import com.example.quimbolitos.quimbolito.entity.EstadoEmocional;
import com.example.quimbolitos.quimbolito.entity.Pareja;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.EstadoEmocionalRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EstadoEmocionalService {

    private final EstadoEmocionalRepository estadoEmocionalRepository;
    private final AccessService accessService;

    @Transactional(readOnly = true)
    public List<EstadoEmocionalResponse> getEstadosDeMiPareja(Authentication authentication) {
        Pareja pareja = accessService.getActivePareja(authentication);
        Map<Long, EstadoEmocional> estadosGuardados = estadoEmocionalRepository.findAllByPareja_Id(pareja.getId())
                .stream()
                .collect(Collectors.toMap(estado -> estado.getUsuario().getId(), Function.identity()));

        return Stream.of(pareja.getUsuarioUno(), pareja.getUsuarioDos())
                .map(usuario -> toResponse(estadosGuardados.get(usuario.getId()), pareja, usuario))
                .toList();
    }

    @Transactional
    public EstadoEmocionalResponse updateMiEstado(Authentication authentication, UpdateEstadoEmocionalRequest request) {
        Pareja pareja = accessService.getActivePareja(authentication);
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        EstadoEmocional estadoEmocional = estadoEmocionalRepository.findByPareja_IdAndUsuario_Id(pareja.getId(), usuario.getId())
                .orElseGet(() -> EstadoEmocional.builder()
                        .pareja(pareja)
                        .usuario(usuario)
                        .build());

        estadoEmocional.setEstado(request.getEstado());
        estadoEmocional.setEmoji(request.getEmoji());
        estadoEmocional.setFechaActualizacion(LocalDateTime.now());

        return toResponse(estadoEmocionalRepository.save(estadoEmocional));
    }

    private EstadoEmocionalResponse toResponse(EstadoEmocional estadoEmocional) {
        return EstadoEmocionalResponse.builder()
                .id(estadoEmocional.getId())
                .parejaId(estadoEmocional.getPareja().getId())
                .usuarioId(estadoEmocional.getUsuario().getId())
                .usuarioNombre(estadoEmocional.getUsuario().getNombre())
                .estado(estadoEmocional.getEstado())
                .emoji(estadoEmocional.getEmoji())
                .fechaActualizacion(estadoEmocional.getFechaActualizacion())
                .build();
    }

    private EstadoEmocionalResponse toResponse(EstadoEmocional estadoEmocional, Pareja pareja, Usuario usuario) {
        if (estadoEmocional != null) {
            return toResponse(estadoEmocional);
        }

        return EstadoEmocionalResponse.builder()
                .id(null)
                .parejaId(pareja.getId())
                .usuarioId(usuario.getId())
                .usuarioNombre(usuario.getNombre())
                .estado(null)
                .emoji(null)
                .fechaActualizacion(null)
                .build();
    }
}
