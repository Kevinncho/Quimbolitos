package com.example.quimbolitos.quimbolito.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.visualpregunta.CreateVisualPreguntaRequest;
import com.example.quimbolitos.quimbolito.dto.visualpregunta.UpdateVisualPreguntaRequest;
import com.example.quimbolitos.quimbolito.dto.visualpregunta.VisualPreguntaResponse;
import com.example.quimbolitos.quimbolito.entity.Pregunta;
import com.example.quimbolitos.quimbolito.entity.Subtema;
import com.example.quimbolitos.quimbolito.entity.VisualPregunta;
import com.example.quimbolitos.quimbolito.repository.PreguntaRepository;
import com.example.quimbolitos.quimbolito.repository.SubtemaRepository;
import com.example.quimbolitos.quimbolito.repository.VisualPreguntaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VisualPreguntaService {

    private final VisualPreguntaRepository visualPreguntaRepository;
    private final PreguntaRepository preguntaRepository;
    private final SubtemaRepository subtemaRepository;
    private final AccessService accessService;
    private final FileStorageService fileStorageService;

    @Transactional
    public VisualPreguntaResponse create(Long preguntaId, Authentication authentication, CreateVisualPreguntaRequest request) {
        accessService.requireAdmin(authentication);
        Pregunta pregunta = getPreguntaById(preguntaId, authentication);

        visualPreguntaRepository.findByPregunta_Id(preguntaId).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La pregunta ya tiene configuracion visual");
        });

        VisualPregunta visual = VisualPregunta.builder()
                .pregunta(pregunta)
                .opcionALabel(request.getOpcionALabel())
                .opcionASrc(request.getOpcionASrc())
                .opcionAAlt(request.getOpcionAAlt())
                .opcionBLabel(request.getOpcionBLabel())
                .opcionBSrc(request.getOpcionBSrc())
                .opcionBAlt(request.getOpcionBAlt())
                .build();

        return toResponse(visualPreguntaRepository.save(visual));
    }

    @Transactional(readOnly = true)
    public VisualPreguntaResponse findByPreguntaId(Long preguntaId, Authentication authentication) {
        Pregunta pregunta = preguntaRepository.findById(preguntaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pregunta no encontrada"));
        VisualPregunta visual = visualPreguntaRepository.findByPregunta_Id(pregunta.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Configuracion visual no encontrada"));
        return toResponse(visual);
    }

    @Transactional(readOnly = true)
    public List<VisualPreguntaResponse> findAllBySubtema(Long subtemaId, Authentication authentication) {
        Subtema subtema = subtemaRepository.findById(subtemaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subtema no encontrado"));
        return visualPreguntaRepository.findAllByPregunta_Subtema_Id(subtema.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public VisualPreguntaResponse update(Long preguntaId, Authentication authentication, UpdateVisualPreguntaRequest request) {
        accessService.requireAdmin(authentication);
        Pregunta pregunta = getPreguntaById(preguntaId, authentication);

        VisualPregunta visual = visualPreguntaRepository.findByPregunta_Id(pregunta.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Configuracion visual no encontrada"));

        if (request.getOpcionALabel() != null) {
            visual.setOpcionALabel(request.getOpcionALabel());
        }
        if (request.getOpcionASrc() != null) {
            visual.setOpcionASrc(request.getOpcionASrc());
        }
        if (request.getOpcionAAlt() != null) {
            visual.setOpcionAAlt(request.getOpcionAAlt());
        }
        if (request.getOpcionBLabel() != null) {
            visual.setOpcionBLabel(request.getOpcionBLabel());
        }
        if (request.getOpcionBSrc() != null) {
            visual.setOpcionBSrc(request.getOpcionBSrc());
        }
        if (request.getOpcionBAlt() != null) {
            visual.setOpcionBAlt(request.getOpcionBAlt());
        }

        return toResponse(visualPreguntaRepository.save(visual));
    }

    @Transactional
    public String uploadVisualImage(Authentication authentication, org.springframework.web.multipart.MultipartFile imagen) {
        accessService.requireAdmin(authentication);
        String storedName = fileStorageService.storeVisualPreguntaPhoto(imagen);
        return "/assets/visual-preguntas/" + storedName;
    }

    @Transactional
    public void delete(Long preguntaId, Authentication authentication) {
        accessService.requireAdmin(authentication);
        Pregunta pregunta = getPreguntaById(preguntaId, authentication);
        VisualPregunta visual = visualPreguntaRepository.findByPregunta_Id(pregunta.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Configuracion visual no encontrada"));
        visualPreguntaRepository.delete(visual);
    }

    private Pregunta getPreguntaById(Long id, Authentication authentication) {
        Pregunta pregunta = preguntaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pregunta no encontrada"));
        accessService.validatePreguntaAccess(pregunta, authentication);
        return pregunta;
    }

    private Subtema getSubtemaById(Long id, Authentication authentication) {
        Subtema subtema = subtemaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subtema no encontrado"));
        accessService.validateSubtemaAccess(subtema, authentication);
        return subtema;
    }

    private VisualPreguntaResponse toResponse(VisualPregunta visual) {
        return VisualPreguntaResponse.builder()
                .id(visual.getId())
                .preguntaId(visual.getPregunta().getId())
                .opcionALabel(visual.getOpcionALabel())
                .opcionASrc(visual.getOpcionASrc())
                .opcionAAlt(visual.getOpcionAAlt())
                .opcionBLabel(visual.getOpcionBLabel())
                .opcionBSrc(visual.getOpcionBSrc())
                .opcionBAlt(visual.getOpcionBAlt())
                .build();
    }
}
