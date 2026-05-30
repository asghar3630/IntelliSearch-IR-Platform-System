package com.informationretrival.intellisearchirplatform.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app")
@Validated
@Getter
@Setter
public class AppProperties {

    @Valid
    private Lucene lucene = new Lucene();

    @Valid
    private Pdf pdf = new Pdf();

    @Getter
    @Setter
    public static class Lucene {
        @NotBlank(message = "Lucene index directory must be configured (app.lucene.index-dir)")
        private String indexDir;
    }

    @Getter
    @Setter
    public static class Pdf {
        @NotBlank(message = "PDF storage directory must be configured (app.pdf.storage-dir)")
        private String storageDir;
    }
}
