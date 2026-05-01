package com.example.quimbolitos.quimbolito.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.dto.pareja.CreateParejaRequest;
import com.example.quimbolitos.quimbolito.dto.pareja.ParejaResponse;
import com.example.quimbolitos.quimbolito.entity.EstadoPareja;
import com.example.quimbolitos.quimbolito.entity.Pareja;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.ParejaRepository;
import com.example.quimbolitos.quimbolito.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParejaService {

    private final ParejaRepository parejaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AccessService accessService;

    @Transactional
    public ParejaResponse createInvitation(Authentication authentication, CreateParejaRequest request) {
        Usuario actual = accessService.getAuthenticatedUser(authentication);
        Usuario invitado = usuarioRepository.findById(request.getUsuarioInvitadoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario invitado no encontrado"));

        if (actual.getId().equals(invitado.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes invitarte a ti mismo");
        }

        validateNoOpenPair(actual);
        validateNoOpenPair(invitado);

        Pareja pareja = Pareja.builder()
                .usuarioUno(actual)
                .usuarioDos(invitado)
                .estado(EstadoPareja.PENDIENTE)
                .codigoInvitacion(UUID.randomUUID().toString())
                .fechaCreacion(LocalDateTime.now())
                .build();

        return toResponse(parejaRepository.save(pareja));
    }

    @Transactional(readOnly = true)
    public List<ParejaResponse> getMyPairs(Authentication authentication) {
        Usuario actual = accessService.getAuthenticatedUser(authentication);
        return parejaRepository.findAllByUsuarioUno_IdOrUsuarioDos_Id(actual.getId(), actual.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ParejaResponse getById(Long id, Authentication authentication) {
        Pareja pareja = getParejaById(id);
        accessService.validateParejaAccess(pareja, authentication);
        return toResponse(pareja);
    }

    @Transactional
    public ParejaResponse acceptInvitation(Long id, Authentication authentication) {
        Pareja pareja = getParejaById(id);
        Usuario actual = accessService.getAuthenticatedUser(authentication);

        System.out.println("Aceptando pareja id: " + pareja.getId());
        System.out.println("usuarioDosId esperado: " + pareja.getUsuarioDos().getId());
        System.out.println("usuario actual id: " + actual.getId());
        System.out.println("usuario actual email: " + actual.getEmail());

        if (!pareja.getUsuarioDos().getId().equals(actual.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el usuario invitado puede aceptar la invitacion");
        }

        validateNoOpenPair(actual, pareja.getId());
        validateNoOpenPair(pareja.getUsuarioUno(), pareja.getId());

        pareja.setEstado(EstadoPareja.ACTIVA);
        pareja.setFechaRespuesta(LocalDateTime.now());

        return toResponse(parejaRepository.save(pareja));
    }

    @Transactional
    public ParejaResponse rejectInvitation(Long id, Authentication authentication) {
        Pareja pareja = getParejaById(id);
        Usuario actual = accessService.getAuthenticatedUser(authentication);

        if (!pareja.getUsuarioDos().getId().equals(actual.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el usuario invitado puede rechazar la invitacion");
        }

        pareja.setEstado(EstadoPareja.RECHAZADA);
        pareja.setFechaRespuesta(LocalDateTime.now());

        return toResponse(parejaRepository.save(pareja));
    }

    @Transactional
    public void deletePair(Long id, Authentication authentication) {
        Pareja pareja = getParejaById(id);
        accessService.validateParejaAccess(pareja, authentication);
        parejaRepository.delete(pareja);
    }

    private Pareja getParejaById(Long id) {
        return parejaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pareja no encontrada"));
    }

    private void validateNoOpenPair(Usuario usuario) {
        validateNoOpenPair(usuario, null);
    }

    private void validateNoOpenPair(Usuario usuario, Long ignoreId) {
        boolean hasOpen = parejaRepository.findAllByUsuarioUno_IdOrUsuarioDos_Id(usuario.getId(), usuario.getId())
                .stream()
                .filter(pareja -> ignoreId == null || !pareja.getId().equals(ignoreId))
                .anyMatch(pareja -> pareja.getEstado() == EstadoPareja.ACTIVA || pareja.getEstado() == EstadoPareja.PENDIENTE);

        if (hasOpen) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario ya tiene una relacion activa o pendiente");
        }
    }

    private ParejaResponse toResponse(Pareja pareja) {
        return ParejaResponse.builder()
                .id(pareja.getId())
                .estado(pareja.getEstado())
                .codigoInvitacion(pareja.getCodigoInvitacion())
                .fechaCreacion(pareja.getFechaCreacion())
                .fechaRespuesta(pareja.getFechaRespuesta())
                .usuarioUnoId(pareja.getUsuarioUno().getId())
                .usuarioUnoNombre(pareja.getUsuarioUno().getNombre())
                .usuarioUnoFotoPerfil(pareja.getUsuarioUno().getFotoPerfil())
                .usuarioUnoLatitud(pareja.getUsuarioUno().getLatitud())
                .usuarioUnoLongitud(pareja.getUsuarioUno().getLongitud())
                .usuarioDosId(pareja.getUsuarioDos().getId())
                .usuarioDosNombre(pareja.getUsuarioDos().getNombre())
                .usuarioDosFotoPerfil(pareja.getUsuarioDos().getFotoPerfil())
                .usuarioDosLatitud(pareja.getUsuarioDos().getLatitud())
                .usuarioDosLongitud(pareja.getUsuarioDos().getLongitud())
                .build();
    }
}
