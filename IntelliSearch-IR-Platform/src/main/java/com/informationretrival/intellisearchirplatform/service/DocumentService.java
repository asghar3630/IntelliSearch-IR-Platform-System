package com.informationretrival.intellisearchirplatform.service;

import com.informationretrival.intellisearchirplatform.config.AppProperties;
import com.informationretrival.intellisearchirplatform.entity.ArticleMeta;
import com.informationretrival.intellisearchirplatform.lucene.LuceneIndexService;
import com.informationretrival.intellisearchirplatform.repository.ArticleMetaRepository;
import com.informationretrival.intellisearchirplatform.util.PdfTextExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final ArticleMetaRepository articleMetaRepository;
    private final LuceneIndexService luceneIndexService;
    private final PdfTextExtractor pdfTextExtractor;
    private final AppProperties appProperties;

    @Transactional(readOnly = true)
    public List<ArticleMeta> findAll() {
        return articleMetaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<ArticleMeta> findByDocumentId(Integer documentId) {
        return articleMetaRepository.findById(documentId);
    }

    @Transactional
    public ArticleMeta save(ArticleMeta meta) {
        ArticleMeta saved = articleMetaRepository.save(meta);

        String pdfText = "";
        if (saved.getDocumentFileName() != null && !saved.getDocumentFileName().isBlank()) {
            String fullPath = Paths.get(appProperties.getPdf().getStorageDir(), saved.getDocumentFileName()).toString();
            pdfText = pdfTextExtractor.extract(fullPath);
        }

        luceneIndexService.indexOrUpdate(saved, pdfText);
        log.info("Saved and indexed document: {}", saved.getDocumentId());
        return saved;
    }
}
