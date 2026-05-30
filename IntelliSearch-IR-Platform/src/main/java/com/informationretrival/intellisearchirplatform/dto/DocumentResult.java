package com.informationretrival.intellisearchirplatform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentResult {

    private String documentId;
    private String title;
    private String authors;
    private Integer publishedYear;
    private String summary;
    private String documentLink;
    private String filePath;
    private float score;
}
