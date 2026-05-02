package com.example.quimbolitos.quimbolito.config;

import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@ConditionalOnProperty(name = "app.storage.local.enabled", havingValue = "true")
public class StaticResourceConfig implements WebMvcConfigurer {

    private final Path fotoPerfilDir;
    private final Path recuerdosDir;
    private final Path recuerdosMapaDir;
    private final Path cancionesDir;
    private final Path cancionesAudioDir;
    private final Path visualPreguntasDir;

    public StaticResourceConfig(
            @Value("${app.storage.foto-perfil-dir}") String fotoPerfilDir,
            @Value("${app.storage.recuerdos-dir}") String recuerdosDir,
            @Value("${app.storage.recuerdos-mapa-dir}") String recuerdosMapaDir,
            @Value("${app.storage.canciones-dir}") String cancionesDir,
            @Value("${app.storage.canciones-audio-dir}") String cancionesAudioDir,
            @Value("${app.storage.visual-preguntas-dir}") String visualPreguntasDir
    ) {
        this.fotoPerfilDir = Path.of(fotoPerfilDir).toAbsolutePath().normalize();
        this.recuerdosDir = Path.of(recuerdosDir).toAbsolutePath().normalize();
        this.recuerdosMapaDir = Path.of(recuerdosMapaDir).toAbsolutePath().normalize();
        this.cancionesDir = Path.of(cancionesDir).toAbsolutePath().normalize();
        this.cancionesAudioDir = Path.of(cancionesAudioDir).toAbsolutePath().normalize();
        this.visualPreguntasDir = Path.of(visualPreguntasDir).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = this.fotoPerfilDir.toUri().toString();
        if (!location.endsWith("/")) {
            location += "/";
        }
        String recuerdosLocation = this.recuerdosDir.toUri().toString();
        if (!recuerdosLocation.endsWith("/")) {
            recuerdosLocation += "/";
        }
        String cancionesLocation = this.cancionesDir.toUri().toString();
        if (!cancionesLocation.endsWith("/")) {
            cancionesLocation += "/";
        }
        String cancionesAudioLocation = this.cancionesAudioDir.toUri().toString();
        if (!cancionesAudioLocation.endsWith("/")) {
            cancionesAudioLocation += "/";
        }

        String recuerdosMapaLocation = this.recuerdosMapaDir.toUri().toString();
        if (!recuerdosMapaLocation.endsWith("/")) {
            recuerdosMapaLocation += "/";
        }

        String visualPreguntasLocation = this.visualPreguntasDir.toUri().toString();
        if (!visualPreguntasLocation.endsWith("/")) {
            visualPreguntasLocation += "/";
        }

        registry.addResourceHandler("/assets/**")
                .addResourceLocations(
                        location,
                        recuerdosLocation,
                        recuerdosMapaLocation,
                        cancionesLocation,
                        cancionesAudioLocation,
                        visualPreguntasLocation
                );
    }
}
