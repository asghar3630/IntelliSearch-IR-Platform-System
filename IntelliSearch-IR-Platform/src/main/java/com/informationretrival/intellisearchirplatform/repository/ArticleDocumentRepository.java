package com.informationretrival.intellisearchirplatform.repository;

import com.informationretrival.intellisearchirplatform.entity.ArticleDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArticleDocumentRepository extends JpaRepository<ArticleDocument, Long> {

    Optional<ArticleDocument> findByDocumentId(Integer documentId);
}
