package com.informationretrival.intellisearchirplatform.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

/**
 * Utility for extracting plain text from PDF files using Apache PDFBox 3.x.
 * Thread-safe: creates a new PDFTextStripper per call.
 */
@Component
@Slf4j
public class PdfTextExtractor {

    /**
     * Extracts all text from the given PDF file.
     *
     * @param pdfFile the PDF file to read
     * @return extracted plain text, or empty string if extraction fails
     */
    public String extract(File pdfFile) {
        if (!pdfFile.exists()) {
            log.warn("PDF file not found, skipping extraction: {}", pdfFile.getAbsolutePath());
            return "";
        }
        if (!pdfFile.canRead()) {
            log.warn("PDF file not readable: {}", pdfFile.getAbsolutePath());
            return "";
        }

        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            log.debug("Extracted {} chars from {}", text.length(), pdfFile.getName());
            return text;
        } catch (IOException e) {
            log.warn("Failed to extract text from PDF [{}]: {}", pdfFile.getName(), e.getMessage());
            return "";
        }
    }

    /**
     * Convenience overload accepting a file path string.
     */
    public String extract(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return "";
        }
        return extract(new File(filePath));
    }
}
