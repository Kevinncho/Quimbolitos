package com.example.quimbolitos.quimbolito.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of("png", "jpg", "jpeg", "webp", "gif");
    private static final Set<String> ALLOWED_AUDIO_EXTENSIONS = Set.of("mp3", "wav", "ogg", "m4a", "aac", "mpeg", "mpga");
    private static final String ASSETS_BASE_PATH = "/assets/";

    private final boolean localStorageEnabled;
    private final Path fotoPerfilDir;
    private final Path recuerdosDir;
    private final Path peliculasDir;
    private final Path recuerdosMapaDir;
    private final Path cancionesDir;
    private final Path cancionesAudioDir;
    private final Path visualPreguntasDir;

    private final CloudinaryService cloudinaryService;
    private final SupabaseStorageService supabaseStorageService;

    public FileStorageService(
            @Value("${app.storage.local.enabled:false}") boolean localStorageEnabled,
            @Value("${app.storage.foto-perfil-dir:storage/foto-perfil}") String fotoPerfilDir,
            @Value("${app.storage.recuerdos-dir:storage/recuerdos}") String recuerdosDir,
            @Value("${app.storage.peliculas-dir:storage/peliculas}") String peliculasDir,
            @Value("${app.storage.recuerdos-mapa-dir:storage/recuerdos-mapa}") String recuerdosMapaDir,
            @Value("${app.storage.canciones-dir:storage/canciones}") String cancionesDir,
            @Value("${app.storage.canciones-audio-dir:storage/canciones-audio}") String cancionesAudioDir,
            @Value("${app.storage.visual-preguntas-dir:storage/visual-preguntas}") String visualPreguntasDir,
            CloudinaryService cloudinaryService,
            SupabaseStorageService supabaseStorageService
    ) {
        this.localStorageEnabled = localStorageEnabled;
        this.fotoPerfilDir = Path.of(fotoPerfilDir).toAbsolutePath().normalize();
        this.recuerdosDir = Path.of(recuerdosDir).toAbsolutePath().normalize();
        this.peliculasDir = Path.of(peliculasDir).toAbsolutePath().normalize();
        this.recuerdosMapaDir = Path.of(recuerdosMapaDir).toAbsolutePath().normalize();
        this.cancionesDir = Path.of(cancionesDir).toAbsolutePath().normalize();
        this.cancionesAudioDir = Path.of(cancionesAudioDir).toAbsolutePath().normalize();
        this.visualPreguntasDir = Path.of(visualPreguntasDir).toAbsolutePath().normalize();
        this.cloudinaryService = cloudinaryService;
        this.supabaseStorageService = supabaseStorageService;
    }

    public String storeProfilePhoto(MultipartFile file) {
        validateImage(file);
        if (localStorageEnabled) {
            return storeLocally(file, fotoPerfilDir);
        }
        // Flujo anterior:
        // return cloudinaryService.uploadImage(file, "quimbolito/foto-perfil");
        return cloudinaryService.uploadImage(file, "quimbolito/foto-perfil");
    }

    public String storeRecuerdoPhoto(MultipartFile file) {
        validateImage(file);
        if (localStorageEnabled) {
            return storeLocally(file, recuerdosDir);
        }
        // Flujo anterior:
        // return cloudinaryService.uploadImage(file, "quimbolito/recuerdos");
        return cloudinaryService.uploadImage(file, "quimbolito/recuerdos");
    }

    public String storeRecuerdoMapaPhoto(MultipartFile file) {
        validateImage(file);
        if (localStorageEnabled) {
            return storeLocally(file, recuerdosMapaDir);
        }
        // Flujo anterior:
        // return cloudinaryService.uploadImage(file, "quimbolito/recuerdos-mapa");
        return cloudinaryService.uploadImage(file, "quimbolito/recuerdos-mapa");
    }

    public String storePeliculaPhoto(MultipartFile file) {
        validateImage(file);
        if (localStorageEnabled) {
            return storeLocally(file, peliculasDir);
        }
        return cloudinaryService.uploadImage(file, "quimbolito/peliculas");
    }

    public String storeCancionPhoto(MultipartFile file) {
        validateImage(file);
        if (localStorageEnabled) {
            return storeLocally(file, cancionesDir);
        }
        // Flujo anterior:
        // return cloudinaryService.uploadImage(file, "quimbolito/canciones");
        return cloudinaryService.uploadImage(file, "quimbolito/canciones");
    }

    public String storeCancionAudio(MultipartFile file) {
        validateAudio(file);
        if (localStorageEnabled) {
            return storeLocally(file, cancionesAudioDir);
        }
        // Flujo anterior:
        // return supabaseStorageService.uploadAudio(file);
        return supabaseStorageService.uploadAudio(file);
    }

    public String storeVisualPreguntaPhoto(MultipartFile file) {
        validateImage(file);
        if (localStorageEnabled) {
            return storeLocally(file, visualPreguntasDir);
        }
        // Flujo anterior:
        // return cloudinaryService.uploadImage(file, "quimbolito/visual-preguntas");
        return cloudinaryService.uploadImage(file, "quimbolito/visual-preguntas");
    }

    private void validateImage(MultipartFile file) {
        validateFile(file, ALLOWED_IMAGE_EXTENSIONS, "La imagen no puede estar vacia", "Formato de imagen no permitido");
    }

    private void validateAudio(MultipartFile file) {
        validateFile(file, ALLOWED_AUDIO_EXTENSIONS, "El audio no puede estar vacio", "Formato de audio no permitido");
    }

    private void validateFile(MultipartFile file,
                              Set<String> allowedExtensions,
                              String emptyMessage,
                              String invalidExtensionMessage) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(emptyMessage);
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        if (originalName.isBlank() || originalName.contains("..")) {
            throw new IllegalArgumentException("Nombre de archivo invalido");
        }

        String extension = getExtension(originalName).toLowerCase();
        if (extension.isBlank() || !allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException(invalidExtensionMessage);
        }
    }

    private String storeLocally(MultipartFile file, Path directory) {
        try {
            Files.createDirectories(directory);

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
            String sanitizedFileName = sanitizeFileName(originalName);
            Path targetFile = buildUniqueTarget(directory, sanitizedFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return ASSETS_BASE_PATH + targetFile.getFileName();
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo guardar el archivo en almacenamiento local", ex);
        }
    }

    private Path buildUniqueTarget(Path directory, String sanitizedFileName) {
        Path candidate = directory.resolve(sanitizedFileName);
        if (!Files.exists(candidate)) {
            return candidate;
        }

        String extension = getExtension(sanitizedFileName);
        String baseName = sanitizedFileName;
        if (!extension.isBlank()) {
            baseName = sanitizedFileName.substring(0, sanitizedFileName.length() - extension.length() - 1);
        }

        String uniqueFileName = extension.isBlank()
                ? baseName + "_" + UUID.randomUUID()
                : baseName + "_" + UUID.randomUUID() + "." + extension;

        return directory.resolve(uniqueFileName);
    }

    private String sanitizeFileName(String originalName) {
        String extension = getExtension(originalName);
        String baseName = extension.isBlank()
                ? originalName
                : originalName.substring(0, originalName.length() - extension.length() - 1);

        String sanitizedBaseName = baseName.replaceAll("[^A-Za-z0-9._-]", "_");
        if (sanitizedBaseName.isBlank()) {
            sanitizedBaseName = "archivo";
        }

        return extension.isBlank()
                ? sanitizedBaseName
                : sanitizedBaseName + "." + extension.toLowerCase();
    }

    private String getExtension(String name) {
        int index = name.lastIndexOf('.');
        if (index == -1 || index == name.length() - 1) {
            return "";
        }
        return name.substring(index + 1);
    }
}
