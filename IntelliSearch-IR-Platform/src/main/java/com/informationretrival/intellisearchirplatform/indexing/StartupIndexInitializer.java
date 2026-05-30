package com.informationretrival.intellisearchirplatform.indexing;

import com.informationretrival.intellisearchirplatform.config.AppProperties;
import com.informationretrival.intellisearchirplatform.entity.ArticleMeta;
import com.informationretrival.intellisearchirplatform.lucene.LuceneIndexService;
import com.informationretrival.intellisearchirplatform.repository.ArticleMetaRepository;
import com.informationretrival.intellisearchirplatform.util.PdfTextExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupIndexInitializer implements ApplicationRunner {

    private final ArticleMetaRepository articleMetaRepository;
    private final PdfTextExtractor pdfTextExtractor;
    private final LuceneIndexService luceneIndexService;
    private final AppProperties appProperties;

    @Override
    public void run(ApplicationArguments args) {
        log.info("=== Starting Lucene index build ===");
        long start = System.currentTimeMillis();

        List<ArticleMeta> articles = articleMetaRepository.findAll();
        if (articles.isEmpty()) {
            log.warn("No articles found in documents.research_articles_meta — Lucene index will be empty.");
            return;
        }

        log.info("Loaded {} articles from documents.research_articles_meta. Extracting PDF text...", articles.size());
        Map<String, String> contentMap = extractPdfContent(articles);

        luceneIndexService.rebuildIndex(articles, contentMap);

        long elapsed = System.currentTimeMillis() - start;
        log.info("=== Lucene index build complete in {}ms ===", elapsed);
    }

    private Map<String, String> extractPdfContent(List<ArticleMeta> articles) {
        String storageDir = appProperties.getPdf().getStorageDir();
        Map<String, String> contentMap = new HashMap<>(articles.size());
        int extracted = 0;
        int missing = 0;

        for (ArticleMeta meta : articles) {
            String key = String.valueOf(meta.getDocumentId());

            if (meta.getDocumentFileName() == null || meta.getDocumentFileName().isBlank()) {
                missing++;
                contentMap.put(key, "");
                continue;
            }

            Path pdfPath = Paths.get(storageDir, meta.getDocumentFileName());
            String text = pdfTextExtractor.extract(pdfPath.toString());
            contentMap.put(key, text);

            if (!text.isBlank()) {
                extracted++;
            } else {
                missing++;
            }
        }

        log.info("PDF extraction complete — text extracted: {}, missing/failed: {}", extracted, missing);
        return contentMap;
    }
}
