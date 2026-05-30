package com.informationretrival.intellisearchirplatform.controller;

import com.informationretrival.intellisearchirplatform.dto.SearchRequest;
import com.informationretrival.intellisearchirplatform.dto.SearchResponse;
import com.informationretrival.intellisearchirplatform.service.SearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing the search API.
 *
 * <pre>
 * POST /api/search
 * Content-Type: application/json
 * {
 *   "query": "deep learning healthcare",
 *   "page": 0,
 *   "size": 10
 * }
 * </pre>
 */
@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Slf4j
public class SearchController {

    private final SearchService searchService;

    @PostMapping("/search")
    public ResponseEntity<SearchResponse> search(@Valid @RequestBody SearchRequest request) {
        log.info("POST /api/search — query='{}', page={}, size={}",
                request.getQuery(), request.getPage(), request.getSize());
        SearchResponse response = searchService.search(request);
        return ResponseEntity.ok(response);
    }
}
