package com.informationretrival.intellisearchirplatform.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class DocumentUploadRequest {

    @NotEmpty(message = "documents list must not be empty")
    @Valid
    private List<DocumentUploadItem> documents;
}
