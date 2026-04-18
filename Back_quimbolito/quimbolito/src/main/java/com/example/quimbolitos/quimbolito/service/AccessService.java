package com.example.quimbolitos.quimbolito.service;

import java.util.Comparator;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.quimbolitos.quimbolito.entity.EstadoPareja;
import com.example.quimbolitos.quimbolito.entity.Pareja;
import com.example.quimbolitos.quimbolito.entity.Pregunta;
import com.example.quimbolitos.quimbolito.entity.Respuesta;
import com.example.quimbolitos.quimbolito.entity.RolUsuario;
import com.example.quimbolitos.quimbolito.entity.Subtema;
import com.example.quimbolitos.quimbolito.entity.Tema;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.ParejaRepository;
import com.example.quimbolitos.quimbolito.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccessService {

    private final UsuarioRepository usuarioRepository;
    private final ParejaRepository parejaRepository;

    public Usuario getAuthenticatedUser(Authentication authentication) {
        return usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario autenticado no encontrado"));
    }

    public boolean isAdmin(Usuario usuario) {
        return usuario.getRol() == RolUsuario.ADMIN;
    }

    public void requireAdmin(Authentication authentication) {
        Usuario usuario = getAuthenticatedUser(authentication);
        if (!isAdmin(usuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo un administrador puede modificar el catalogo");
        }
    }

    public Pareja getActivePareja(Authentication authentication) {
        Usuario usuario = getAuthenticatedUser(authentication);
        return parejaRepository.findAllByUsuarioUno_IdOrUsuarioDos_Id(usuario.getId(), usuario.getId())
                .stream()
                .filter(pareja -> pareja.getEstado() == EstadoPareja.ACTIVA)
                .max(Comparator.comparing(Pareja::getFechaCreacion))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para acceder a esta funcionalidad. Debes tener una pareja activa"));
    }

    public void validateParejaAccess(Pareja pareja, Authentication authentication) {
        Usuario usuario = getAuthenticatedUser(authentication);
        if (isAdmin(usuario)) {
            return;
        }

        boolean member = pareja.getUsuarioUno().getId().equals(usuario.getId())
                || pareja.getUsuarioDos().getId().equals(usuario.getId());

        if (!member) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para acceder a esta pareja");
        }
    }

    public void validateTemaAccess(Tema tema, Authentication authentication) {
        if (tema.getPareja() == null) {
            return;
        }
        validateParejaAccess(tema.getPareja(), authentication);
    }

    public void validateSubtemaAccess(Subtema subtema, Authentication authentication) {
        validateTemaAccess(subtema.getTema(), authentication);
    }

    public void validatePreguntaAccess(Pregunta pregunta, Authentication authentication) {
        validateSubtemaAccess(pregunta.getSubtema(), authentication);
    }

    public void validateRespuestaAccess(Respuesta respuesta, Authentication authentication) {
        validatePreguntaAccess(respuesta.getPregunta(), authentication);
    }
}
