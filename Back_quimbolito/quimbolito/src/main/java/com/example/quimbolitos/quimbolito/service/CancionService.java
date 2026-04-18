package com.example.quimbolitos.quimbolito.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.cancion.CancionResponse;
import com.example.quimbolitos.quimbolito.entity.Cancion;
import com.example.quimbolitos.quimbolito.entity.EstadoPareja;
import com.example.quimbolitos.quimbolito.entity.Pareja;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.CancionRepository;
import com.example.quimbolitos.quimbolito.repository.ParejaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CancionService {

    private final CancionRepository cancionRepository;
    private final ParejaRepository parejaRepository;
    private final AccessService accessService;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<CancionResponse> getCanciones(Authentication authentication) {
        return getCanciones(authentication, "fecha");
    }

    @Transactional(readOnly = true)
    public List<CancionResponse> getCanciones(Authentication authentication, String orden) {
        Usuario usuario = accessService.getAuthenticatedUser(authentication);
        List<Cancion> canciones;

        Pareja parejaActiva = parejaRepository.findAllByUsuarioUno_IdOrUsuarioDos_Id(usuario.getId(), usuario.getId())
                .stream()
                .filter(pareja -> pareja.getEstado() == EstadoPareja.ACTIVA)
                .findFirst()
                .orElse(null);

        if (parejaActiva != null) {
            canciones = cancionRepository.findAllByUsuario_IdInOrderByIdDesc(
                    List.of(parejaActiva.getUsuarioUno().getId(), parejaActiva.getUsuarioDos().getId())
            );
        } else {
            canciones = cancionRepository.findAllByUsuario_IdOrderByIdDesc(usuario.getId());
        }

        if ("usuario".equalsIgnoreCase(orden)) {
            canciones = canciones.stream()
                    .sorted((a, b) -> {
                        String nombreA = a.getUsuario() != null ? a.getUsuario().getNombre() : "";
                        String nombreB = b.getUsuario() != null ? b.getUsuario().getNombre() : "";
                        int cmp = nombreA.compareToIgnoreCase(nombreB);
                        if (cmp != 0) {
                            return cmp;
                        }
                        return Long.compare(b.getId(), a.getId());
                    })
                    .toList();
        }

        return canciones.stream().map(this::toResponse).toList();
    }

    @Transactional
    public CancionResponse createCancion(Authentication authentication,
                                         String titulo,
                                         String artista,
                                         String album,
                                         String dedicatoria,
                                         MultipartFile imagen,
                                         MultipartFile audio) {
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (titulo == null || titulo.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El titulo es obligatorio");
        }

        String fotoUrl = null;
        if (imagen != null && !imagen.isEmpty()) {
            String storedName = fileStorageService.storeCancionPhoto(imagen);
            fotoUrl = "/assets/" + storedName;
        }

        String audioUrl = null;
        if (audio != null && !audio.isEmpty()) {
            String storedAudio = fileStorageService.storeCancionAudio(audio);
            audioUrl = "/assets/" + storedAudio;
        }

        Cancion cancion = Cancion.builder()
                .titulo(titulo.trim())
                .artista(artista == null ? null : artista.trim())
                .album(album == null ? null : album.trim())
                .dedicatoria(dedicatoria == null ? null : dedicatoria.trim())
                .url(fotoUrl)
                .audioUrl(audioUrl)
                .usuario(usuario)
                .build();

        return toResponse(cancionRepository.save(cancion));
    }

    @Transactional
    public CancionResponse updateCancion(Long id,
                                         Authentication authentication,
                                         String titulo,
                                         String artista,
                                         String album,
                                         String dedicatoria,
                                         MultipartFile imagen,
                                         MultipartFile audio) {
        Cancion cancion = cancionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Canción no encontrada"));
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (!cancion.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes editar esta canción");
        }

        if (titulo != null && !titulo.trim().isEmpty()) {
            cancion.setTitulo(titulo.trim());
        }

        if (artista != null) {
            cancion.setArtista(artista.trim().isEmpty() ? null : artista.trim());
        }

        if (album != null) {
            cancion.setAlbum(album.trim().isEmpty() ? null : album.trim());
        }

        if (dedicatoria != null) {
            cancion.setDedicatoria(dedicatoria.trim().isEmpty() ? null : dedicatoria.trim());
        }

        if (imagen != null && !imagen.isEmpty()) {
            String storedName = fileStorageService.storeCancionPhoto(imagen);
            cancion.setUrl("/assets/" + storedName);
        }

        if (audio != null && !audio.isEmpty()) {
            String storedAudio = fileStorageService.storeCancionAudio(audio);
            cancion.setAudioUrl("/assets/" + storedAudio);
        }

        return toResponse(cancionRepository.save(cancion));
    }

    @Transactional
    public void deleteCancion(Long id, Authentication authentication) {
        Cancion cancion = cancionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Canción no encontrada"));
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (!cancion.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes eliminar esta canción");
        }

        cancionRepository.delete(cancion);
    }

    private CancionResponse toResponse(Cancion cancion) {
        return CancionResponse.builder()
                .id(cancion.getId())
                .titulo(cancion.getTitulo())
                .artista(cancion.getArtista())
                .album(cancion.getAlbum())
                .url(cancion.getUrl())
                .audioUrl(cancion.getAudioUrl())
                .dedicatoria(cancion.getDedicatoria())
                .usuarioId(cancion.getUsuario().getId())
                .usuarioNombre(cancion.getUsuario().getNombre())
                .build();
    }
}
