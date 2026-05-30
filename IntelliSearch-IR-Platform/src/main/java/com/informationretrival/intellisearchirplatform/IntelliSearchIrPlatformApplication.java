package com.informationretrival.intellisearchirplatform;

import com.informationretrival.intellisearchirplatform.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class IntelliSearchIrPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(IntelliSearchIrPlatformApplication.class, args);
    }
}
