package com.informationretrival.intellisearchirplatform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DocumentUploadItem {

    @NotBlank(message = "documentFileName must not be blank")
    private String documentFileName;

    @NotBlank(message = "documentBase64 must not be blank")
    private String documentBase64;
}
