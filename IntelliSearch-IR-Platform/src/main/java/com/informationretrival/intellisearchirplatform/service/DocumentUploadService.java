package com.informationretrival.intellisearchirplatform.service;

import com.informationretrival.intellisearchirplatform.dto.DocumentUploadItem;
import com.informationretrival.intellisearchirplatform.dto.DocumentUploadResponse;
import com.informationretrival.intellisearchirplatform.entity.ArticleDocument;
import com.informationretrival.intellisearchirplatform.entity.ArticleMeta;
import com.informationretrival.intellisearchirplatform.repository.ArticleDocumentRepository;
import com.informationretrival.intellisearchirplatform.repository.ArticleMetaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentUploadService {

    private final ArticleMetaRepository articleMetaRepository;
    private final ArticleDocumentRepository articleDocumentRepository;

    @Transactional
    public DocumentUploadResponse uploadDocuments(List<DocumentUploadItem> items) {
        List<String> errors = new ArrayList<>();
        int saved = 0;

        for (int i = 0; i < items.size(); i++) {
            DocumentUploadItem item = items.get(i);
            String fileName = item.getDocumentFileName();

            try {
                // 1. Look up documentID from meta table by fileName
                Optional<ArticleMeta> metaOpt = articleMetaRepository.findByDocumentFileName(fileName);
                if (metaOpt.isEmpty()) {
                    String msg = String.format("[%d] No matching record found for fileName '%s'", i, fileName);
                    log.warn(msg);
                    errors.add(msg);
                    continue;
                }

                ArticleMeta meta = metaOpt.get();

                // 2. Decode base64 to binary
                byte[] binaryData;
                try {
                    binaryData = Base64.getDecoder().decode(item.getDocumentBase64());
                } catch (IllegalArgumentException e) {
                    String msg = String.format("[%d] Invalid base64 for fileName '%s': %s", i, fileName, e.getMessage());
                    log.warn(msg);
                    errors.add(msg);
                    continue;
                }

                // 3. Save to research_articles_docuements
                ArticleDocument doc = new ArticleDocument();
                doc.setDocumentId(meta.getDocumentId());
                doc.setDocument(binaryData);
                articleDocumentRepository.save(doc);

                saved++;
                log.debug("Saved document for fileName '{}' with documentID {}", fileName, meta.getDocumentId());

            } catch (Exception e) {
                String msg = String.format("[%d] Failed to process fileName '%s': %s", i, fileName, e.getMessage());
                log.error(msg, e);
                errors.add(msg);
            }
        }

        log.info("Document upload complete — received: {}, saved: {}, failed: {}",
                items.size(), saved, errors.size());

        return DocumentUploadResponse.builder()
                .totalReceived(items.size())
                .totalSaved(saved)
                .totalFailed(errors.size())
                .errors(errors)
                .build();
    }
}
