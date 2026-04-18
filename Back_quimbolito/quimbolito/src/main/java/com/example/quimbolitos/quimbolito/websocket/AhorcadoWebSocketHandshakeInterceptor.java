package com.example.quimbolitos.quimbolito.websocket;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.quimbolitos.quimbolito.entity.Pareja;
import com.example.quimbolitos.quimbolito.entity.Usuario;
import com.example.quimbolitos.quimbolito.repository.ParejaRepository;
import com.example.quimbolitos.quimbolito.repository.UsuarioRepository;
import com.example.quimbolitos.quimbolito.security.JwtService;
import com.example.quimbolitos.quimbolito.entity.EstadoPareja;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AhorcadoWebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final ParejaRepository parejaRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String token = UriComponentsBuilder.fromUri(request.getURI())
                .build()
                .getQueryParams()
                .getFirst("token");

        if (token == null || token.isBlank()) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        String username;
        try {
            username = jwtService.extractUsername(token);
        } catch (Exception ex) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        Usuario usuario = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        Pareja pareja = parejaRepository.findAllByUsuarioUno_IdOrUsuarioDos_Id(usuario.getId(), usuario.getId())
                .stream()
                .filter(p -> p.getEstado() == EstadoPareja.ACTIVA)
                .findFirst()
                .orElse(null);

        if (pareja == null) {
            response.setStatusCode(HttpStatus.BAD_REQUEST);
            return false;
        }

        attributes.put("parejaId", pareja.getId());
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // no-op
    }
}
