package com.informationretrival.intellisearchirplatform.controller;

import com.informationretrival.intellisearchirplatform.dto.DocumentContentResponse;
import com.informationretrival.intellisearchirplatform.dto.DocumentUploadRequest;
import com.informationretrival.intellisearchirplatform.dto.DocumentUploadResponse;
import com.informationretrival.intellisearchirplatform.entity.ArticleDocument;
import com.informationretrival.intellisearchirplatform.repository.ArticleDocumentRepository;
import com.informationretrival.intellisearchirplatform.service.DocumentUploadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Optional;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentUploadService documentUploadService;
    private final ArticleDocumentRepository articleDocumentRepository;

    @PostMapping("/documents/upload")
    public ResponseEntity<DocumentUploadResponse> uploadDocuments(
            @Valid @RequestBody DocumentUploadRequest request) {

        log.info("POST /api/documents/upload — {} document(s) received", request.getDocuments().size());
        DocumentUploadResponse response = documentUploadService.uploadDocuments(request.getDocuments());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/documents/{documentId}/content")
    public ResponseEntity<DocumentContentResponse> getDocumentContent(
            @PathVariable Integer documentId) {

        log.info("GET /api/documents/{}/content", documentId);

        Optional<ArticleDocument> docOpt = articleDocumentRepository.findByDocumentId(documentId);
        if (docOpt.isEmpty() || docOpt.get().getDocument() == null) {
            return ResponseEntity.notFound().build();
        }

        String base64 = Base64.getEncoder().encodeToString(docOpt.get().getDocument());

        return ResponseEntity.ok(DocumentContentResponse.builder()
                .documentId(documentId)
                .documentBase64(base64)
                .build());
    }
}
