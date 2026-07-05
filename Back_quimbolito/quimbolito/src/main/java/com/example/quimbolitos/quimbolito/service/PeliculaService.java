package com.example.quimbolitos.quimbolito.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.pelicula.PeliculaResponse;
import com.example.quimbolitos.quimbolito.dto.pelicula.ResenaPeliculaResponse;
import com.example.quimbolitos.quimbolito.entity.EstadoPareja;
import com.example.quimbolitos.quimbolito.entity.GeneroPelicula;
import com.example.quimbolitos.quimbolito.entity.Pareja;
import com.example.quimbolitos.quimbolito.entity.Pelicula;
import com.example.quimbolitos.quimbolito.entity.ResenaPelicula;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.ParejaRepository;
import com.example.quimbolitos.quimbolito.repository.PeliculaRepository;
import com.example.quimbolitos.quimbolito.repository.ResenaPeliculaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PeliculaService {

    private final PeliculaRepository peliculaRepository;
    private final ResenaPeliculaRepository resenaPeliculaRepository;
    private final ParejaRepository parejaRepository;
    private final AccessService accessService;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<PeliculaResponse> getPeliculas(Authentication authentication) {
        Usuario usuario = accessService.getAuthenticatedUser(authentication);
        Pareja parejaActiva = getParejaActiva(usuario.getId());
        List<Pelicula> peliculas;

        if (parejaActiva != null) {
            peliculas = peliculaRepository.findAllByUsuario_IdInOrderByFechaCreacionDesc(
                    List.of(parejaActiva.getUsuarioUno().getId(), parejaActiva.getUsuarioDos().getId())
            );
        } else {
            peliculas = peliculaRepository.findAllByUsuario_IdOrderByFechaCreacionDesc(usuario.getId());
        }

        return peliculas.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PeliculaResponse getPeliculaById(Long id, Authentication authentication) {
        Pelicula pelicula = getPeliculaEntityById(id, authentication);
        return toResponse(pelicula);
    }

    @Transactional
    public PeliculaResponse createPelicula(Authentication authentication,
                                           String titulo,
                                           String descripcion,
                                           String linkVer,
                                           Boolean visto,
                                           List<String> generos,
                                           MultipartFile imagen) {
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (titulo == null || titulo.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El titulo de la pelicula es obligatorio");
        }

        if (linkVer == null || linkVer.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El link para ver la pelicula es obligatorio");
        }

        String fotoUrl = null;
        if (imagen != null && !imagen.isEmpty()) {
            fotoUrl = fileStorageService.storePeliculaPhoto(imagen);
        }

        Pelicula pelicula = Pelicula.builder()
                .titulo(titulo.trim())
                .descripcion(normalizeText(descripcion))
                .linkVer(linkVer.trim())
                .fotoUrl(fotoUrl)
                .visto(Boolean.TRUE.equals(visto))
                .generos(parseGeneros(generos))
                .fechaCreacion(LocalDateTime.now())
                .usuario(usuario)
                .build();

        return toResponse(peliculaRepository.save(pelicula));
    }

    @Transactional
    public PeliculaResponse updatePelicula(Long id,
                                           Authentication authentication,
                                           String titulo,
                                           String descripcion,
                                           String linkVer,
                                           Boolean visto,
                                           List<String> generos,
                                           MultipartFile imagen) {
        Pelicula pelicula = peliculaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pelicula no encontrada"));
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (!pelicula.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes editar esta pelicula");
        }

        if (titulo != null && !titulo.trim().isEmpty()) {
            pelicula.setTitulo(titulo.trim());
        }

        if (descripcion != null) {
            pelicula.setDescripcion(normalizeText(descripcion));
        }

        if (linkVer != null && !linkVer.trim().isEmpty()) {
            pelicula.setLinkVer(linkVer.trim());
        }

        if (visto != null) {
            pelicula.setVisto(visto);
        }

        if (generos != null) {
            pelicula.setGeneros(parseGeneros(generos));
        }

        if (imagen != null && !imagen.isEmpty()) {
            pelicula.setFotoUrl(fileStorageService.storePeliculaPhoto(imagen));
        }

        return toResponse(peliculaRepository.save(pelicula));
    }

    @Transactional
    public void deletePelicula(Long id, Authentication authentication) {
        Pelicula pelicula = peliculaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pelicula no encontrada"));
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (!pelicula.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes eliminar esta pelicula");
        }

        peliculaRepository.delete(pelicula);
    }

    @Transactional(readOnly = true)
    public List<ResenaPeliculaResponse> getResenas(Long peliculaId, Authentication authentication) {
        Pelicula pelicula = getPeliculaEntityById(peliculaId, authentication);
        return resenaPeliculaRepository.findAllByPelicula_IdOrderByFechaActualizacionAsc(pelicula.getId())
                .stream()
                .map(this::toResenaResponse)
                .toList();
    }

    @Transactional
    public ResenaPeliculaResponse guardarResena(Long peliculaId,
                                                String comentario,
                                                Integer rating,
                                                Authentication authentication) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El rating debe estar entre 1 y 5 estrellas");
        }

        Pelicula pelicula = getPeliculaEntityById(peliculaId, authentication);
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        ResenaPelicula resena = resenaPeliculaRepository.findByPelicula_IdAndUsuario_Id(peliculaId, usuario.getId())
                .orElseGet(() -> ResenaPelicula.builder()
                        .pelicula(pelicula)
                        .usuario(usuario)
                        .build());

        resena.setComentario(normalizeText(comentario));
        resena.setRating(rating);
        resena.setFechaActualizacion(LocalDateTime.now());

        return toResenaResponse(resenaPeliculaRepository.save(resena));
    }

    private Pelicula getPeliculaEntityById(Long id, Authentication authentication) {
        Pelicula pelicula = peliculaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pelicula no encontrada"));
        validatePeliculaAccess(pelicula, authentication);
        return pelicula;
    }

    private PeliculaResponse toResponse(Pelicula pelicula) {
        List<ResenaPelicula> resenas = resenaPeliculaRepository.findAllByPelicula_IdOrderByFechaActualizacionAsc(pelicula.getId());
        double ratingPromedio = resenas.stream()
                .mapToInt(ResenaPelicula::getRating)
                .average()
                .orElse(0.0);

        return PeliculaResponse.builder()
                .id(pelicula.getId())
                .titulo(pelicula.getTitulo())
                .descripcion(pelicula.getDescripcion())
                .linkVer(pelicula.getLinkVer())
                .fotoUrl(pelicula.getFotoUrl())
                .visto(Boolean.TRUE.equals(pelicula.getVisto()))
                .generos(pelicula.getGeneros().stream().toList())
                .usuarioId(pelicula.getUsuario().getId())
                .usuarioNombre(pelicula.getUsuario().getNombre())
                .usuarioFotoPerfil(pelicula.getUsuario().getFotoPerfil())
                .fechaCreacion(pelicula.getFechaCreacion())
                .ratingPromedio(ratingPromedio)
                .totalResenas((long) resenas.size())
                .build();
    }

    private ResenaPeliculaResponse toResenaResponse(ResenaPelicula resena) {
        return ResenaPeliculaResponse.builder()
                .id(resena.getId())
                .comentario(resena.getComentario())
                .rating(resena.getRating())
                .fechaActualizacion(resena.getFechaActualizacion())
                .usuarioId(resena.getUsuario().getId())
                .usuarioNombre(resena.getUsuario().getNombre())
                .usuarioFotoPerfil(resena.getUsuario().getFotoPerfil())
                .build();
    }

    private void validatePeliculaAccess(Pelicula pelicula, Authentication authentication) {
        Usuario usuario = accessService.getAuthenticatedUser(authentication);
        if (pelicula.getUsuario().getId().equals(usuario.getId())) {
            return;
        }

        Pareja parejaActiva = getParejaActiva(usuario.getId());
        if (parejaActiva == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver esta pelicula");
        }

        boolean pertenecePareja = parejaActiva.getUsuarioUno().getId().equals(pelicula.getUsuario().getId())
                || parejaActiva.getUsuarioDos().getId().equals(pelicula.getUsuario().getId());

        if (!pertenecePareja) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver esta pelicula");
        }
    }

    private Pareja getParejaActiva(Long usuarioId) {
        return parejaRepository.findAllByUsuarioUno_IdOrUsuarioDos_Id(usuarioId, usuarioId)
                .stream()
                .filter(pareja -> pareja.getEstado() == EstadoPareja.ACTIVA)
                .findFirst()
                .orElse(null);
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Set<GeneroPelicula> parseGeneros(List<String> generos) {
        if (generos == null || generos.isEmpty()) {
            return new LinkedHashSet<>();
        }

        Set<GeneroPelicula> valores = new LinkedHashSet<>();
        for (String genero : generos) {
            if (genero == null || genero.trim().isEmpty()) {
                continue;
            }

            String normalizado = genero.trim()
                    .toUpperCase(Locale.ROOT)
                    .replace(' ', '_');

            try {
                valores.add(GeneroPelicula.valueOf(normalizado));
            } catch (IllegalArgumentException exception) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Genero no valido. Valores permitidos: " + Arrays.toString(GeneroPelicula.values())
                );
            }
        }

        return valores;
    }
}
