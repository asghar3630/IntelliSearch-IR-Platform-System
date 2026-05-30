package com.informationretrival.intellisearchirplatform.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SearchResponse {

    private String query;
    private int page;
    private int size;
    private long totalCount;
    private int totalPages;
    private List<DocumentResult> documents;
}
