package com.example.quimbolitos.quimbolito.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.example.quimbolitos.quimbolito.websocket.AhorcadoWebSocketHandler;
import com.example.quimbolitos.quimbolito.websocket.AhorcadoWebSocketHandshakeInterceptor;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final AhorcadoWebSocketHandler ahorcadoWebSocketHandler;
    private final AhorcadoWebSocketHandshakeInterceptor handshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(ahorcadoWebSocketHandler, "/ws/ahorcado")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOrigins("*");
    }
}
