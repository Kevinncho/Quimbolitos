package com.example.quimbolitos.quimbolito.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.respuesta.CreateRespuestaRequest;
import com.example.quimbolitos.quimbolito.dto.respuesta.RespuestaResponse;
import com.example.quimbolitos.quimbolito.dto.respuesta.UpdateRespuestaRequest;
import com.example.quimbolitos.quimbolito.entity.Pregunta;
import com.example.quimbolitos.quimbolito.entity.Respuesta;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.entity.Pareja;
import com.example.quimbolitos.quimbolito.repository.PreguntaRepository;
import com.example.quimbolitos.quimbolito.repository.RespuestaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RespuestaService {

    private final RespuestaRepository respuestaRepository;
    private final PreguntaRepository preguntaRepository;
    private final AccessService accessService;

    @Transactional
    public RespuestaResponse create(Long preguntaId, Authentication authentication, CreateRespuestaRequest request) {
        Pregunta pregunta = getPreguntaById(preguntaId);
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        respuestaRepository.findByPregunta_IdAndUsuario_Id(preguntaId, usuario.getId())
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario ya respondio esta pregunta");
                });

        Respuesta respuesta = Respuesta.builder()
                .contenido(request.getContenido())
                .fechaRespuesta(LocalDateTime.now())
                .pregunta(pregunta)
                .usuario(usuario)
                .build();

        return toResponse(respuestaRepository.save(respuesta));
    }

    @Transactional(readOnly = true)
    public List<RespuestaResponse> findAllByPregunta(Long preguntaId, Authentication authentication) {
        Pregunta pregunta = getPreguntaById(preguntaId);
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        Set<Long> usuariosPermitidos = getUsuariosPermitidos(usuario, authentication);

        return respuestaRepository.findAllByPregunta_Id(preguntaId)
                .stream()
                .filter(respuesta -> usuariosPermitidos.contains(respuesta.getUsuario().getId()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RespuestaResponse findById(Long id, Authentication authentication) {
        Respuesta respuesta = getRespuestaById(id);
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (!accessService.isAdmin(usuario)
                && !getUsuariosPermitidos(usuario, authentication).contains(respuesta.getUsuario().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver esta respuesta");
        }

        return toResponse(respuesta);
    }

    @Transactional
    public RespuestaResponse update(Long id, Authentication authentication, UpdateRespuestaRequest request) {
        Respuesta respuesta = getRespuestaById(id);
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (!accessService.isAdmin(usuario) && !respuesta.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo puedes editar tu propia respuesta");
        }

        respuesta.setContenido(request.getContenido());
        respuesta.setFechaRespuesta(LocalDateTime.now());

        return toResponse(respuestaRepository.save(respuesta));
    }

    @Transactional
    public void delete(Long id, Authentication authentication) {
        Respuesta respuesta = getRespuestaById(id);
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (!accessService.isAdmin(usuario) && !respuesta.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo puedes eliminar tu propia respuesta");
        }

        respuestaRepository.delete(respuesta);
    }

    private Pregunta getPreguntaById(Long id) {
        return preguntaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pregunta no encontrada"));
    }

    private Respuesta getRespuestaById(Long id) {
        return respuestaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Respuesta no encontrada"));
    }

    private Set<Long> getUsuariosPermitidos(Usuario usuario, Authentication authentication) {
        Set<Long> usuariosPermitidos = new java.util.HashSet<>();
        usuariosPermitidos.add(usuario.getId());

        try {
            Pareja pareja = accessService.getActivePareja(authentication);
            usuariosPermitidos.add(pareja.getUsuarioUno().getId());
            usuariosPermitidos.add(pareja.getUsuarioDos().getId());
        } catch (ResponseStatusException ignored) {
            // Si no hay pareja activa, solo se permiten respuestas del propio usuario.
        }

        return usuariosPermitidos;
    }

    private RespuestaResponse toResponse(Respuesta respuesta) {
        return RespuestaResponse.builder()
                .id(respuesta.getId())
                .contenido(respuesta.getContenido())
                .fechaRespuesta(respuesta.getFechaRespuesta())
                .preguntaId(respuesta.getPregunta().getId())
                .preguntaEnunciado(respuesta.getPregunta().getEnunciado())
                .usuarioId(respuesta.getUsuario().getId())
                .usuarioNombre(respuesta.getUsuario().getNombre())
                .build();
    }
}
