package com.informationretrival.intellisearchirplatform.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DocumentUploadResponse {

    private int totalReceived;
    private int totalSaved;
    private int totalFailed;
    private List<String> errors;
}
