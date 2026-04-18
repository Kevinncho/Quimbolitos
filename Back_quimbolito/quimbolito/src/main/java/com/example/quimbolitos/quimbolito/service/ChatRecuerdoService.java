package com.example.quimbolitos.quimbolito.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.recuerdo.MensajeChatResponse;
import com.example.quimbolitos.quimbolito.entity.ChatRecuerdo;
import com.example.quimbolitos.quimbolito.entity.MensajeChat;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.MensajeChatRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRecuerdoService {

    private final RecuerdoService recuerdoService;
    private final MensajeChatRepository mensajeChatRepository;
    private final AccessService accessService;

    @Transactional(readOnly = true)
    public List<MensajeChatResponse> getMensajes(Long recuerdoId, Authentication authentication) {
        ChatRecuerdo chat = recuerdoService.getChatRecuerdo(recuerdoId, authentication);
        return mensajeChatRepository.findAllByChat_IdOrderByFechaEnvioAsc(chat.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MensajeChatResponse crearMensaje(Long recuerdoId, String contenido, Authentication authentication) {
        if (contenido == null || contenido.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El mensaje no puede estar vacio");
        }

        ChatRecuerdo chat = recuerdoService.getChatRecuerdo(recuerdoId, authentication);
        Usuario usuario = accessService.getAuthenticatedUser(authentication);

        MensajeChat mensaje = MensajeChat.builder()
                .autor(usuario.getNombre())
                .contenido(contenido.trim())
                .chat(chat)
                .usuario(usuario)
                .build();

        return toResponse(mensajeChatRepository.save(mensaje));
    }

    private MensajeChatResponse toResponse(MensajeChat mensaje) {
        return MensajeChatResponse.builder()
                .id(mensaje.getId())
                .autor(mensaje.getAutor())
                .contenido(mensaje.getContenido())
                .fechaEnvio(mensaje.getFechaEnvio())
                .usuarioId(mensaje.getUsuario() != null ? mensaje.getUsuario().getId() : null)
                .usuarioFotoPerfil(mensaje.getUsuario() != null ? mensaje.getUsuario().getFotoPerfil() : null)
                .build();
    }
}
