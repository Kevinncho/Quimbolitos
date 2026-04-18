package com.example.quimbolitos.quimbolito.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.tema.CreateTemaRequest;
import com.example.quimbolitos.quimbolito.dto.tema.TemaResponse;
import com.example.quimbolitos.quimbolito.dto.tema.UpdateTemaRequest;
import com.example.quimbolitos.quimbolito.entity.Tema;
import com.example.quimbolitos.quimbolito.repository.TemaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TemaService {

    private final TemaRepository temaRepository;
    private final AccessService accessService;

    @Transactional
    public TemaResponse create(Authentication authentication, CreateTemaRequest request) {
        accessService.requireAdmin(authentication);

        Tema tema = Tema.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .build();

        return toResponse(temaRepository.save(tema));
    }

    @Transactional(readOnly = true)
    public List<TemaResponse> findAll(Authentication authentication) {
        return temaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TemaResponse findById(Long id, Authentication authentication) {
        Tema tema = getTemaById(id);
        return toResponse(tema);
    }

    @Transactional
    public TemaResponse update(Long id, Authentication authentication, UpdateTemaRequest request) {
        accessService.requireAdmin(authentication);
        Tema tema = getTemaById(id);

        if (request.getNombre() != null) {
            tema.setNombre(request.getNombre());
        }
        if (request.getDescripcion() != null) {
            tema.setDescripcion(request.getDescripcion());
        }

        return toResponse(temaRepository.save(tema));
    }

    @Transactional
    public void delete(Long id, Authentication authentication) {
        accessService.requireAdmin(authentication);
        Tema tema = getTemaById(id);
        temaRepository.delete(tema);
    }

    private Tema getTemaById(Long id) {
        return temaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado"));
    }

    private TemaResponse toResponse(Tema tema) {
        return TemaResponse.builder()
                .id(tema.getId())
                .nombre(tema.getNombre())
                .descripcion(tema.getDescripcion())
                .totalSubtemas((long) tema.getSubtemas().size())
                .build();
    }
}
