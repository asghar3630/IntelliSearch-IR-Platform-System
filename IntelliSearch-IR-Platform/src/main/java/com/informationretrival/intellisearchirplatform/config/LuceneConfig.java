package com.informationretrival.intellisearchirplatform.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class LuceneConfig {

    private final AppProperties appProperties;

    /**
     * FSDirectory backed by the configured index path.
     * Spring closes this bean (Directory implements Closeable) on context shutdown.
     */
    @Bean
    public Directory luceneDirectory() throws IOException {
        Path indexPath = Paths.get(appProperties.getLucene().getIndexDir());
        Files.createDirectories(indexPath);
        log.info("Lucene FSDirectory opened at: {}", indexPath.toAbsolutePath());
        return FSDirectory.open(indexPath);
    }

    /**
     * Shared StandardAnalyzer — thread-safe and reused for both indexing and querying.
     */
    @Bean
    public StandardAnalyzer luceneAnalyzer() {
        return new StandardAnalyzer();
    }
}
