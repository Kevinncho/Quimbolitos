package com.example.quimbolitos.quimbolito.service;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SupabaseStorageService {

    private final String supabaseUrl;
    private final String supabaseKey;
    private final String audioBucket;

    public SupabaseStorageService(@Value("${supabase.url}") String supabaseUrl,
                                  @Value("${supabase.key}") String supabaseKey,
                                  @Value("${supabase.audio-bucket:audios}") String audioBucket) {
        this.supabaseUrl = normalizeBaseUrl(supabaseUrl);
        this.supabaseKey = supabaseKey;
        this.audioBucket = audioBucket;
    }

    public String uploadAudio(MultipartFile file) {
        try {
            String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "audio" : file.getOriginalFilename());
            String fileName = UUID.randomUUID() + "_" + sanitizeFileName(originalName);
            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);

            HttpURLConnection conn = (HttpURLConnection) new URL(
                    supabaseUrl + "/storage/v1/object/" + audioBucket + "/" + encodedFileName
            ).openConnection();

            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + supabaseKey);
            conn.setRequestProperty("apikey", supabaseKey);
            conn.setRequestProperty("x-upsert", "false");
            conn.setRequestProperty("Content-Type", resolveContentType(file));

            conn.getOutputStream().write(file.getBytes());

            int responseCode = conn.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK && responseCode != HttpURLConnection.HTTP_CREATED) {
                throw new IllegalStateException("Error subiendo a Supabase: " + responseCode);
            }

            return supabaseUrl + "/storage/v1/object/public/" + audioBucket + "/" + encodedFileName;
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo subir el audio a Supabase", ex);
        }
    }

    private String resolveContentType(MultipartFile file) {
        return file.getContentType() != null && !file.getContentType().isBlank()
                ? file.getContentType()
                : "application/octet-stream";
    }

    private String normalizeBaseUrl(String url) {
        return url != null && url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
