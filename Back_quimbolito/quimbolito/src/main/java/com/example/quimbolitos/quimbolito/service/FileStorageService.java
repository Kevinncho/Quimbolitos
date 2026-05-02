package com.example.quimbolitos.quimbolito.service;

import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of("png", "jpg", "jpeg", "webp", "gif");
    private static final Set<String> ALLOWED_AUDIO_EXTENSIONS = Set.of("mp3", "wav", "ogg", "m4a", "aac", "mpeg", "mpga");

    private final CloudinaryService cloudinaryService;
    private final SupabaseStorageService supabaseStorageService;

    public String storeProfilePhoto(MultipartFile file) {
        validateImage(file);
        return cloudinaryService.uploadImage(file, "quimbolito/foto-perfil");
    }

    public String storeRecuerdoPhoto(MultipartFile file) {
        validateImage(file);
        return cloudinaryService.uploadImage(file, "quimbolito/recuerdos");
    }

    public String storeRecuerdoMapaPhoto(MultipartFile file) {
        validateImage(file);
        return cloudinaryService.uploadImage(file, "quimbolito/recuerdos-mapa");
    }

    public String storeCancionPhoto(MultipartFile file) {
        validateImage(file);
        return cloudinaryService.uploadImage(file, "quimbolito/canciones");
    }

    public String storeCancionAudio(MultipartFile file) {
        validateAudio(file);
        return supabaseStorageService.uploadAudio(file);
    }

    public String storeVisualPreguntaPhoto(MultipartFile file) {
        validateImage(file);
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

    private String getExtension(String name) {
        int index = name.lastIndexOf('.');
        if (index == -1 || index == name.length() - 1) {
            return "";
        }
        return name.substring(index + 1);
    }
}
