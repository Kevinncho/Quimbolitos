package com.example.quimbolitos.quimbolito.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final Path fotoPerfilDir;
    private final Path recuerdosDir;
    private final Path recuerdosMapaDir;
    private final Path cancionesDir;
    private final Path cancionesAudioDir;
    private final Path visualPreguntasDir;
    private final Set<String> allowedExtensions = Set.of("png", "jpg", "jpeg", "webp", "gif");
    private final Set<String> allowedAudioExtensions = Set.of("mp3", "wav", "ogg", "m4a", "aac", "mpeg", "mpga");

    public FileStorageService(
            @Value("${app.storage.foto-perfil-dir}") String fotoPerfilDir,
            @Value("${app.storage.recuerdos-dir}") String recuerdosDir,
            @Value("${app.storage.recuerdos-mapa-dir}") String recuerdosMapaDir,
            @Value("${app.storage.canciones-dir}") String cancionesDir,
            @Value("${app.storage.canciones-audio-dir}") String cancionesAudioDir,
            @Value("${app.storage.visual-preguntas-dir}") String visualPreguntasDir
    ) {
        this.fotoPerfilDir = Paths.get(fotoPerfilDir).toAbsolutePath().normalize();
        this.recuerdosDir = Paths.get(recuerdosDir).toAbsolutePath().normalize();
        this.recuerdosMapaDir = Paths.get(recuerdosMapaDir).toAbsolutePath().normalize();
        this.cancionesDir = Paths.get(cancionesDir).toAbsolutePath().normalize();
        this.cancionesAudioDir = Paths.get(cancionesAudioDir).toAbsolutePath().normalize();
        this.visualPreguntasDir = Paths.get(visualPreguntasDir).toAbsolutePath().normalize();
    }

    public String storeProfilePhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("La imagen no puede estar vacia");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        if (originalName.isBlank() || originalName.contains("..")) {
            throw new IllegalArgumentException("Nombre de archivo invalido");
        }

        String extension = getExtension(originalName).toLowerCase();
        if (extension.isBlank() || !allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("Formato de imagen no permitido");
        }

        try {
            Files.createDirectories(fotoPerfilDir);
            String safeName = buildSafeFileName(originalName, extension);
            String finalName = resolveFinalName(safeName, extension);
            Path target = fotoPerfilDir.resolve(finalName);
            Files.copy(file.getInputStream(), target);
            return finalName;
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo guardar la imagen", ex);
        }
    }

    public Path getFotoPerfilDir() {
        return fotoPerfilDir;
    }

    public String storeRecuerdoPhoto(MultipartFile file) {
        return storeFile(file, recuerdosDir);
    }

    public String storeRecuerdoMapaPhoto(MultipartFile file) {
        return storeFile(file, recuerdosMapaDir);
    }

    public String storeCancionPhoto(MultipartFile file) {
        return storeFile(file, cancionesDir);
    }

    public String storeCancionAudio(MultipartFile file) {
        return storeAudioFile(file, cancionesAudioDir);
    }

    public String storeVisualPreguntaPhoto(MultipartFile file) {
        return storeFile(file, visualPreguntasDir);
    }

    private String resolveFinalName(String originalName, String extension) {
        Path candidate = fotoPerfilDir.resolve(originalName);
        if (!Files.exists(candidate)) {
            return originalName;
        }
        String baseName = originalName.substring(0, originalName.length() - (extension.length() + 1));
        int counter = 2;
        while (true) {
            String withCounter = baseName + "_" + counter + "." + extension;
            if (!Files.exists(fotoPerfilDir.resolve(withCounter))) {
                return withCounter;
            }
            counter++;
        }
    }

    private String getExtension(String name) {
        int index = name.lastIndexOf('.');
        if (index == -1 || index == name.length() - 1) {
            return "";
        }
        return name.substring(index + 1);
    }

    private String buildSafeFileName(String originalName, String extension) {
        String baseName = originalName.substring(0, originalName.length() - (extension.length() + 1));
        String sanitized = baseName.replaceAll("[^A-Za-z0-9_-]", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_+|_+$", "");

        if (sanitized.isBlank()) {
            sanitized = "foto";
        }

        return sanitized + "." + extension;
    }

    private String storeFile(MultipartFile file, Path targetDir) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("La imagen no puede estar vacia");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        if (originalName.isBlank() || originalName.contains("..")) {
            throw new IllegalArgumentException("Nombre de archivo invalido");
        }

        String extension = getExtension(originalName).toLowerCase();
        if (extension.isBlank() || !allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("Formato de imagen no permitido");
        }

        try {
            Files.createDirectories(targetDir);
            String safeName = buildSafeFileName(originalName, extension);
            String finalName = resolveFinalNameOnDir(targetDir, safeName, extension);
            Path target = targetDir.resolve(finalName);
            Files.copy(file.getInputStream(), target);
            return finalName;
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo guardar la imagen", ex);
        }
    }

    private String storeAudioFile(MultipartFile file, Path targetDir) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El audio no puede estar vacio");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        if (originalName.isBlank() || originalName.contains("..")) {
            throw new IllegalArgumentException("Nombre de archivo invalido");
        }

        String extension = getExtension(originalName).toLowerCase();
        if (extension.isBlank() || !allowedAudioExtensions.contains(extension)) {
            throw new IllegalArgumentException("Formato de audio no permitido");
        }

        try {
            Files.createDirectories(targetDir);
            String safeName = buildSafeFileName(originalName, extension);
            String finalName = resolveFinalNameOnDir(targetDir, safeName, extension);
            Path target = targetDir.resolve(finalName);
            Files.copy(file.getInputStream(), target);
            return finalName;
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo guardar el audio", ex);
        }
    }

    private String resolveFinalNameOnDir(Path targetDir, String originalName, String extension) {
        Path candidate = targetDir.resolve(originalName);
        if (!Files.exists(candidate)) {
            return originalName;
        }
        String baseName = originalName.substring(0, originalName.length() - (extension.length() + 1));
        int counter = 2;
        while (true) {
            String withCounter = baseName + "_" + counter + "." + extension;
            if (!Files.exists(targetDir.resolve(withCounter))) {
                return withCounter;
            }
            counter++;
        }
    }
}
