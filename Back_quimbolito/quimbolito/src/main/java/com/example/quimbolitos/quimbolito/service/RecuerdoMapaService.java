package com.example.quimbolitos.quimbolito.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.recuerdomapa.RecuerdoMapaResponse;
import com.example.quimbolitos.quimbolito.dto.recuerdomapa.CreateRecuerdoMapaRequest;
import com.example.quimbolitos.quimbolito.dto.recuerdomapa.UpdateRecuerdoMapaRequest;
import com.example.quimbolitos.quimbolito.entity.Ciudad;
import com.example.quimbolitos.quimbolito.entity.EstadoPareja;
import com.example.quimbolitos.quimbolito.entity.Pais;
import com.example.quimbolitos.quimbolito.entity.Pareja;
import com.example.quimbolitos.quimbolito.entity.RecuerdoMapa;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.CiudadRepository;
import com.example.quimbolitos.quimbolito.repository.PaisRepository;
import com.example.quimbolitos.quimbolito.repository.ParejaRepository;
import com.example.quimbolitos.quimbolito.repository.RecuerdoMapaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecuerdoMapaService {

    private final RecuerdoMapaRepository recuerdoMapaRepository;
    private final ParejaRepository parejaRepository;
    private final PaisRepository paisRepository;
    private final CiudadRepository ciudadRepository;
    private final AccessService accessService;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<RecuerdoMapaResponse> getRecuerdosMapa(Authentication authentication) {
        Usuario usuario = accessService.getAuthenticatedUser(authentication);
        List<RecuerdoMapa> recuerdosMapa;

        Pareja parejaActiva = parejaRepository.findAllByUsuarioUno_IdOrUsuarioDos_Id(usuario.getId(), usuario.getId())
                .stream()
                .filter(pareja -> pareja.getEstado() == EstadoPareja.ACTIVA)
                .findFirst()
                .orElse(null);

        if (parejaActiva != null) {
            recuerdosMapa = recuerdoMapaRepository.findAllByUsuario_IdInOrderByFechaRecuerdoDesc(
                    List.of(parejaActiva.getUsuarioUno().getId(), parejaActiva.getUsuarioDos().getId())
            );
        } else {
            recuerdosMapa = recuerdoMapaRepository.findAllByUsuario_IdOrderByFechaRecuerdoDesc(usuario.getId());
        }

        return recuerdosMapa.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public RecuerdoMapaResponse getRecuerdoMapaById(Long id, Authentication authentication) {
        RecuerdoMapa recuerdoMapa = recuerdoMapaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recuerdo de mapa no encontrado"));
        validateRecuerdoMapaAccess(recuerdoMapa, authentication);
        return toResponse(recuerdoMapa);
    }

    @Transactional
    public RecuerdoMapaResponse createRecuerdoMapa(Authentication authentication,
                                                   CreateRecuerdoMapaRequest request,
                                                   MultipartFile imagen) {
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (request.getTitulo() == null || request.getTitulo().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El titulo es obligatorio");
        }

        if (request.getFechaRecuerdo() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha es obligatoria");
        }

        if (request.getLatitud() == null || request.getLongitud() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las coordenadas son obligatorias");
        }

        String fotoUrl = null;
        if (imagen != null && !imagen.isEmpty()) {
            fotoUrl = fileStorageService.storeRecuerdoMapaPhoto(imagen);
        }

        Pais pais = null;
        if (request.getPaisNombre() != null && !request.getPaisNombre().trim().isEmpty()) {
            final String paisNombre = request.getPaisNombre().trim();
            pais = paisRepository.findByNombre(paisNombre)
                    .orElseGet(() -> paisRepository.save(Pais.builder()
                            .nombre(paisNombre)
                            .build()));
        }

        Ciudad ciudad = null;
        if (request.getCiudadNombre() != null && !request.getCiudadNombre().trim().isEmpty() && pais != null) {
            final Pais paisFinal = pais;
            final String ciudadNombre = request.getCiudadNombre().trim();
            ciudad = ciudadRepository.findByNombreAndPais_Id(ciudadNombre, paisFinal.getId())
                    .orElseGet(() -> ciudadRepository.save(Ciudad.builder()
                            .nombre(ciudadNombre)
                            .pais(paisFinal)
                            .build()));
        }

        RecuerdoMapa recuerdoMapa = RecuerdoMapa.builder()
                .titulo(request.getTitulo().trim())
                .descripcion(request.getDescripcion() == null ? null : request.getDescripcion().trim())
                .latitud(request.getLatitud())
                .longitud(request.getLongitud())
                .fechaRecuerdo(request.getFechaRecuerdo())
                .fotoUrl(fotoUrl)
                .usuario(usuario)
                .pais(pais)
                .ciudad(ciudad)
                .build();

        return toResponse(recuerdoMapaRepository.save(recuerdoMapa));
    }

    @Transactional
    public RecuerdoMapaResponse updateRecuerdoMapa(Long id,
                                                   Authentication authentication,
                                                   UpdateRecuerdoMapaRequest request,
                                                   MultipartFile imagen) {
        RecuerdoMapa recuerdoMapa = recuerdoMapaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recuerdo de mapa no encontrado"));
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (!recuerdoMapa.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes editar este recuerdo de mapa");
        }

        if (request.getTitulo() != null && !request.getTitulo().trim().isEmpty()) {
            recuerdoMapa.setTitulo(request.getTitulo().trim());
        }

        if (request.getDescripcion() != null) {
            recuerdoMapa.setDescripcion(request.getDescripcion().trim().isEmpty() ? null : request.getDescripcion().trim());
        }

        if (request.getLatitud() != null) {
            recuerdoMapa.setLatitud(request.getLatitud());
        }

        if (request.getLongitud() != null) {
            recuerdoMapa.setLongitud(request.getLongitud());
        }

        if (request.getFechaRecuerdo() != null) {
            recuerdoMapa.setFechaRecuerdo(request.getFechaRecuerdo());
        }

        if (imagen != null && !imagen.isEmpty()) {
            recuerdoMapa.setFotoUrl(fileStorageService.storeRecuerdoMapaPhoto(imagen));
        }

        if (request.getPaisNombre() != null && !request.getPaisNombre().trim().isEmpty()) {
            Pais pais = paisRepository.findByNombre(request.getPaisNombre().trim())
                    .orElseGet(() -> paisRepository.save(Pais.builder()
                            .nombre(request.getPaisNombre().trim())
                            .build()));
            recuerdoMapa.setPais(pais);

            // Si hay ciudad, actualizarla también
            if (request.getCiudadNombre() != null && !request.getCiudadNombre().trim().isEmpty()) {
                Ciudad ciudad = ciudadRepository.findByNombreAndPais_Id(request.getCiudadNombre().trim(), pais.getId())
                        .orElseGet(() -> ciudadRepository.save(Ciudad.builder()
                                .nombre(request.getCiudadNombre().trim())
                                .pais(pais)
                                .build()));
                recuerdoMapa.setCiudad(ciudad);
            }
        }

        return toResponse(recuerdoMapaRepository.save(recuerdoMapa));
    }

    @Transactional
    public void deleteRecuerdoMapa(Long id, Authentication authentication) {
        RecuerdoMapa recuerdoMapa = recuerdoMapaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recuerdo de mapa no encontrado"));
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (!recuerdoMapa.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes eliminar este recuerdo de mapa");
        }

        recuerdoMapaRepository.delete(recuerdoMapa);
    }

    private RecuerdoMapaResponse toResponse(RecuerdoMapa recuerdoMapa) {
        return RecuerdoMapaResponse.builder()
                .id(recuerdoMapa.getId())
                .titulo(recuerdoMapa.getTitulo())
                .descripcion(recuerdoMapa.getDescripcion())
                .latitud(recuerdoMapa.getLatitud())
                .longitud(recuerdoMapa.getLongitud())
                .fechaRecuerdo(recuerdoMapa.getFechaRecuerdo())
                .fotoUrl(recuerdoMapa.getFotoUrl())
                .usuarioId(recuerdoMapa.getUsuario().getId())
                .usuarioNombre(recuerdoMapa.getUsuario().getNombre())
                .usuarioFotoPerfil(recuerdoMapa.getUsuario().getFotoPerfil())
                .paisNombre(recuerdoMapa.getPais() != null ? recuerdoMapa.getPais().getNombre() : null)
                .ciudadNombre(recuerdoMapa.getCiudad() != null ? recuerdoMapa.getCiudad().getNombre() : null)
                .build();
    }

    private void validateRecuerdoMapaAccess(RecuerdoMapa recuerdoMapa, Authentication authentication) {
        Usuario usuario = accessService.getAuthenticatedUser(authentication);
        if (recuerdoMapa.getUsuario().getId().equals(usuario.getId())) {
            return;
        }

        Pareja parejaActiva = parejaRepository.findAllByUsuarioUno_IdOrUsuarioDos_Id(usuario.getId(), usuario.getId())
                .stream()
                .filter(pareja -> pareja.getEstado() == EstadoPareja.ACTIVA)
                .findFirst()
                .orElse(null);

        if (parejaActiva == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver este recuerdo de mapa");
        }

        boolean pertenecePareja = parejaActiva.getUsuarioUno().getId().equals(recuerdoMapa.getUsuario().getId())
                || parejaActiva.getUsuarioDos().getId().equals(recuerdoMapa.getUsuario().getId());

        if (!pertenecePareja) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver este recuerdo de mapa");
        }
    }
}
