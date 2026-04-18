package com.example.quimbolitos.quimbolito.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.subtema.CreateSubtemaRequest;
import com.example.quimbolitos.quimbolito.dto.subtema.SubtemaResponse;
import com.example.quimbolitos.quimbolito.dto.subtema.UpdateSubtemaRequest;
import com.example.quimbolitos.quimbolito.entity.Subtema;
import com.example.quimbolitos.quimbolito.entity.Tema;
import com.example.quimbolitos.quimbolito.repository.SubtemaRepository;
import com.example.quimbolitos.quimbolito.repository.TemaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubtemaService {

    private final SubtemaRepository subtemaRepository;
    private final TemaRepository temaRepository;
    private final AccessService accessService;

    @Transactional
    public SubtemaResponse create(Long temaId, Authentication authentication, CreateSubtemaRequest request) {
        accessService.requireAdmin(authentication);
        Tema tema = getTemaById(temaId);

        Subtema subtema = Subtema.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .icono(request.getIcono())
                .tema(tema)
                .build();

        return toResponse(subtemaRepository.save(subtema));
    }

    @Transactional(readOnly = true)
    public List<SubtemaResponse> findAllByTema(Long temaId, Authentication authentication) {
        Tema tema = getTemaById(temaId);

        return subtemaRepository.findAllByTema_Id(temaId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SubtemaResponse findById(Long id, Authentication authentication) {
        Subtema subtema = getById(id);
        return toResponse(subtema);
    }

    @Transactional
    public SubtemaResponse update(Long id, Authentication authentication, UpdateSubtemaRequest request) {
        accessService.requireAdmin(authentication);
        Subtema subtema = getById(id);

        if (request.getNombre() != null) {
            subtema.setNombre(request.getNombre());
        }
        if (request.getDescripcion() != null) {
            subtema.setDescripcion(request.getDescripcion());
        }
        if (request.getIcono() != null) {
            subtema.setIcono(request.getIcono());
        }

        return toResponse(subtemaRepository.save(subtema));
    }

    @Transactional
    public void delete(Long id, Authentication authentication) {
        accessService.requireAdmin(authentication);
        Subtema subtema = getById(id);
        subtemaRepository.delete(subtema);
    }

    private Tema getTemaById(Long temaId) {
        return temaRepository.findById(temaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado"));
    }

    private Subtema getById(Long id) {
        return subtemaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subtema no encontrado"));
    }

    private SubtemaResponse toResponse(Subtema subtema) {
        return SubtemaResponse.builder()
                .id(subtema.getId())
                .nombre(subtema.getNombre())
                .descripcion(subtema.getDescripcion())
                .icono(subtema.getIcono())
                .temaId(subtema.getTema().getId())
                .temaNombre(subtema.getTema().getNombre())
                .build();
    }
}
