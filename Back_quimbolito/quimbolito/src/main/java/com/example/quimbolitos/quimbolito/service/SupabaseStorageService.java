package com.example.quimbolitos.quimbolito.service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

public class SupabaseStorageService {
       @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    public String uploadAudio(MultipartFile file) throws Exception {

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        String uploadUrl = supabaseUrl +
                "/storage/v1/object/audios/" + fileName;

        URL url = new URL(uploadUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setDoOutput(true);
        conn.setRequestMethod("POST");

        conn.setRequestProperty("Authorization", "Bearer " + supabaseKey);
        conn.setRequestProperty("Content-Type", file.getContentType());

        conn.getOutputStream().write(file.getBytes());

        int responseCode = conn.getResponseCode();

        if (responseCode != 200) {
            throw new RuntimeException("Error subiendo a Supabase: " + responseCode);
        }

        // URL pública
        return supabaseUrl +
                "/storage/v1/object/public/audios/" + fileName;
    }
}
