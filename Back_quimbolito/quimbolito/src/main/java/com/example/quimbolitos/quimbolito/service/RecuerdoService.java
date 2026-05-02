package com.example.quimbolitos.quimbolito.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.recuerdo.RecuerdoResponse;
import com.example.quimbolitos.quimbolito.entity.ChatRecuerdo;
import com.example.quimbolitos.quimbolito.entity.EstadoPareja;
import com.example.quimbolitos.quimbolito.entity.Pareja;
import com.example.quimbolitos.quimbolito.entity.Recuerdo;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.ChatRecuerdoRepository;
import com.example.quimbolitos.quimbolito.repository.MensajeChatRepository;
import com.example.quimbolitos.quimbolito.repository.ParejaRepository;
import com.example.quimbolitos.quimbolito.repository.RecuerdoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecuerdoService {

    private final RecuerdoRepository recuerdoRepository;
    private final ParejaRepository parejaRepository;
    private final ChatRecuerdoRepository chatRecuerdoRepository;
    private final MensajeChatRepository mensajeChatRepository;
    private final AccessService accessService;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<RecuerdoResponse> getRecuerdos(Authentication authentication) {
        Usuario usuario = accessService.getAuthenticatedUser(authentication);
        List<Recuerdo> recuerdos;

        Pareja parejaActiva = parejaRepository.findAllByUsuarioUno_IdOrUsuarioDos_Id(usuario.getId(), usuario.getId())
                .stream()
                .filter(pareja -> pareja.getEstado() == EstadoPareja.ACTIVA)
                .findFirst()
                .orElse(null);

        if (parejaActiva != null) {
            recuerdos = recuerdoRepository.findAllByUsuario_IdInOrderByFechaRecuerdoDesc(
                    List.of(parejaActiva.getUsuarioUno().getId(), parejaActiva.getUsuarioDos().getId())
            );
        } else {
            recuerdos = recuerdoRepository.findAllByUsuario_IdOrderByFechaRecuerdoDesc(usuario.getId());
        }

        return recuerdos.stream().map(this::toResponse).toList();
    }

    @Transactional
    public RecuerdoResponse createRecuerdo(Authentication authentication,
                                           String titulo,
                                           String descripcion,
                                           LocalDate fechaRecuerdo,
                                           MultipartFile imagen) {
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (titulo == null || titulo.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El titulo es obligatorio");
        }

        if (fechaRecuerdo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha es obligatoria");
        }

        String fotoUrl = null;
        if (imagen != null && !imagen.isEmpty()) {
            fotoUrl = fileStorageService.storeRecuerdoPhoto(imagen);
        }

        Recuerdo recuerdo = Recuerdo.builder()
                .titulo(titulo.trim())
                .descripcion(descripcion == null ? null : descripcion.trim())
                .fechaRecuerdo(fechaRecuerdo)
                .fotoUrl(fotoUrl)
                .usuario(usuario)
                .build();

        ChatRecuerdo chat = ChatRecuerdo.builder()
                .recuerdo(recuerdo)
                .build();
        recuerdo.setChat(chat);

        return toResponse(recuerdoRepository.save(recuerdo));
    }

    @Transactional(readOnly = true)
    public RecuerdoResponse getRecuerdoById(Long id, Authentication authentication) {
        Recuerdo recuerdo = recuerdoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recuerdo no encontrado"));
        validateRecuerdoAccess(recuerdo, authentication);
        return toResponse(recuerdo);
    }

    @Transactional
    public RecuerdoResponse updateRecuerdo(Long id,
                                           Authentication authentication,
                                           String titulo,
                                           String descripcion,
                                           LocalDate fechaRecuerdo,
                                           MultipartFile imagen) {
        Recuerdo recuerdo = recuerdoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recuerdo no encontrado"));
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (!recuerdo.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes editar este recuerdo");
        }

        if (titulo != null && !titulo.trim().isEmpty()) {
            recuerdo.setTitulo(titulo.trim());
        }

        if (descripcion != null) {
            recuerdo.setDescripcion(descripcion.trim().isEmpty() ? null : descripcion.trim());
        }

        if (fechaRecuerdo != null) {
            recuerdo.setFechaRecuerdo(fechaRecuerdo);
        }

        if (imagen != null && !imagen.isEmpty()) {
            recuerdo.setFotoUrl(fileStorageService.storeRecuerdoPhoto(imagen));
        }

        return toResponse(recuerdoRepository.save(recuerdo));
    }

    @Transactional
    public void deleteRecuerdo(Long id, Authentication authentication) {
        Recuerdo recuerdo = recuerdoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recuerdo no encontrado"));
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        if (!recuerdo.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes eliminar este recuerdo");
        }

        recuerdoRepository.delete(recuerdo);
    }

    @Transactional(readOnly = true)
    public ChatRecuerdo getChatRecuerdo(Long recuerdoId, Authentication authentication) {
        Recuerdo recuerdo = recuerdoRepository.findById(recuerdoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recuerdo no encontrado"));
        validateRecuerdoAccess(recuerdo, authentication);
        return chatRecuerdoRepository.findByRecuerdo_Id(recuerdoId)
                .orElseGet(() -> {
                    ChatRecuerdo chat = ChatRecuerdo.builder()
                            .recuerdo(recuerdo)
                            .build();
                    recuerdo.setChat(chat);
                    return chatRecuerdoRepository.save(chat);
                });
    }

    private RecuerdoResponse toResponse(Recuerdo recuerdo) {
        long mensajesCount = mensajeChatRepository.countByChat_Recuerdo_Id(recuerdo.getId());
        return RecuerdoResponse.builder()
                .id(recuerdo.getId())
                .titulo(recuerdo.getTitulo())
                .descripcion(recuerdo.getDescripcion())
                .fechaRecuerdo(recuerdo.getFechaRecuerdo())
                .fotoUrl(recuerdo.getFotoUrl())
                .usuarioId(recuerdo.getUsuario().getId())
                .usuarioNombre(recuerdo.getUsuario().getNombre())
                .usuarioFotoPerfil(recuerdo.getUsuario().getFotoPerfil())
                .mensajesCount(mensajesCount)
                .build();
    }

    private void validateRecuerdoAccess(Recuerdo recuerdo, Authentication authentication) {
        Usuario usuario = accessService.getAuthenticatedUser(authentication);
        if (recuerdo.getUsuario().getId().equals(usuario.getId())) {
            return;
        }

        Pareja parejaActiva = parejaRepository.findAllByUsuarioUno_IdOrUsuarioDos_Id(usuario.getId(), usuario.getId())
                .stream()
                .filter(pareja -> pareja.getEstado() == EstadoPareja.ACTIVA)
                .findFirst()
                .orElse(null);

        if (parejaActiva == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver este recuerdo");
        }

        boolean pertenecePareja = parejaActiva.getUsuarioUno().getId().equals(recuerdo.getUsuario().getId())
                || parejaActiva.getUsuarioDos().getId().equals(recuerdo.getUsuario().getId());

        if (!pertenecePareja) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver este recuerdo");
        }
    }
}
