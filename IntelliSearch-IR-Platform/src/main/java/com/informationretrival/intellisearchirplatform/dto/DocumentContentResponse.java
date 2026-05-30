package com.informationretrival.intellisearchirplatform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentContentResponse {

    private Integer documentId;
    private String documentBase64;
}
