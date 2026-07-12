package com.example.quimbolitos.quimbolito.websocket;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.example.quimbolitos.quimbolito.dto.tresenraya.TresEnRayaEstadoResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class TresEnRayaWebSocketHandler extends TextWebSocketHandler {

    private final Map<Long, Set<WebSocketSession>> sessionsByPareja = Collections.synchronizedMap(new HashMap<>());
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long parejaId = (Long) session.getAttributes().get("parejaId");
        if (parejaId == null) {
            closeSession(session);
            return;
        }
        sessionsByPareja.computeIfAbsent(parejaId, key -> Collections.synchronizedSet(new HashSet<>()))
                .add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long parejaId = (Long) session.getAttributes().get("parejaId");
        if (parejaId == null) {
            return;
        }
        Set<WebSocketSession> sessions = sessionsByPareja.get(parejaId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                sessionsByPareja.remove(parejaId);
            }
        }
    }

    public void broadcastEstado(Long parejaId, TresEnRayaEstadoResponse estado) {
        broadcastPayload(parejaId, estado);
    }

    public void broadcastCancelacion(Long parejaId) {
        broadcastPayload(parejaId, Map.of("cancelled", true));
    }

    private void broadcastPayload(Long parejaId, Object payloadObject) {
        Set<WebSocketSession> sessions = sessionsByPareja.get(parejaId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        String payload;
        try {
            payload = objectMapper.writeValueAsString(payloadObject);
        } catch (Exception ex) {
            return;
        }

        TextMessage message = new TextMessage(payload);
        synchronized (sessions) {
            sessions.removeIf(session -> {
                if (!session.isOpen()) {
                    return true;
                }
                try {
                    session.sendMessage(message);
                } catch (IOException e) {
                    return true;
                }
                return false;
            });
        }
    }

    private void closeSession(WebSocketSession session) {
        try {
            session.close();
        } catch (IOException ignored) {
        }
    }
}
