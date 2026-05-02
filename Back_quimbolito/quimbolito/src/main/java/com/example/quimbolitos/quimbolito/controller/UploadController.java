package com.example.quimbolitos.quimbolito.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.quimbolitos.quimbolito.service.SupabaseStorageService;

@RestController
@RequestMapping("/api")
public class UploadController {

    @Autowired
    private SupabaseStorageService supabaseService;

    @PostMapping("/upload-audio")
    public Map<String, String> uploadAudio(@RequestParam("file") MultipartFile file) {
        try {
            String url = supabaseService.uploadAudio(file);

            Map<String, String> response = new HashMap<>();
            response.put("url", url);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Error al subir audio", e);
        }
    }  
}
