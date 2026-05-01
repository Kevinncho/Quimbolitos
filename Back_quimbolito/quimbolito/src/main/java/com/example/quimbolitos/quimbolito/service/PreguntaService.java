package com.example.quimbolitos.quimbolito.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.pregunta.CreatePreguntaRequest;
import com.example.quimbolitos.quimbolito.dto.pregunta.PreguntaResponse;
import com.example.quimbolitos.quimbolito.dto.pregunta.UpdatePreguntaRequest;
import com.example.quimbolitos.quimbolito.entity.Pregunta;
import com.example.quimbolitos.quimbolito.entity.Subtema;
import com.example.quimbolitos.quimbolito.repository.PreguntaRepository;
import com.example.quimbolitos.quimbolito.repository.RespuestaRepository;
import com.example.quimbolitos.quimbolito.repository.SubtemaRepository;
import com.example.quimbolitos.quimbolito.repository.VisualPreguntaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PreguntaService {

    private final PreguntaRepository preguntaRepository;
    private final SubtemaRepository subtemaRepository;
    private final RespuestaRepository respuestaRepository;
    private final VisualPreguntaRepository visualPreguntaRepository;
    private final AccessService accessService;

    @Transactional
    public PreguntaResponse create(Long subtemaId, Authentication authentication, CreatePreguntaRequest request) {
        accessService.requireAdmin(authentication);
        Subtema subtema = getSubtemaById(subtemaId);

        Pregunta pregunta = Pregunta.builder()
                .enunciado(request.getEnunciado())
                .descripcion(request.getDescripcion())
                .subtema(subtema)
                .activa(true)
                .build();

        return toResponse(preguntaRepository.save(pregunta));
    }

    @Transactional(readOnly = true)
    public List<PreguntaResponse> findAllBySubtema(Long subtemaId, Authentication authentication) {
        Subtema subtema = getSubtemaById(subtemaId);

        return preguntaRepository.findAllBySubtema_Id(subtemaId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PreguntaResponse findById(Long id, Authentication authentication) {
        Pregunta pregunta = getPreguntaById(id);
        return toResponse(pregunta);
    }

    @Transactional
    public PreguntaResponse update(Long id, Authentication authentication, UpdatePreguntaRequest request) {
        accessService.requireAdmin(authentication);
        Pregunta pregunta = getPreguntaById(id);

        if (request.getEnunciado() != null) {
            pregunta.setEnunciado(request.getEnunciado());
        }
        if (request.getDescripcion() != null) {
            pregunta.setDescripcion(request.getDescripcion());
        }
        if (request.getActiva() != null) {
            pregunta.setActiva(request.getActiva());
        }

        return toResponse(preguntaRepository.save(pregunta));
    }

    @Transactional
    public void delete(Long id, Authentication authentication) {
        accessService.requireAdmin(authentication);
        Pregunta pregunta = getPreguntaById(id);
        visualPreguntaRepository.deleteByPregunta_Id(pregunta.getId());
        respuestaRepository.deleteAllByPregunta_Id(pregunta.getId());
        preguntaRepository.delete(pregunta);
    }

    private Subtema getSubtemaById(Long id) {
        return subtemaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subtema no encontrado"));
    }

    private Pregunta getPreguntaById(Long id) {
        return preguntaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pregunta no encontrada"));
    }

    private PreguntaResponse toResponse(Pregunta pregunta) {
        return PreguntaResponse.builder()
                .id(pregunta.getId())
                .enunciado(pregunta.getEnunciado())
                .descripcion(pregunta.getDescripcion())
                .activa(pregunta.getActiva())
                .temaId(pregunta.getSubtema().getTema().getId())
                .temaNombre(pregunta.getSubtema().getTema().getNombre())
                .subtemaId(pregunta.getSubtema().getId())
                .subtemaNombre(pregunta.getSubtema().getNombre())
                .subtemaIcono(pregunta.getSubtema().getIcono())
                .build();
    }
}
