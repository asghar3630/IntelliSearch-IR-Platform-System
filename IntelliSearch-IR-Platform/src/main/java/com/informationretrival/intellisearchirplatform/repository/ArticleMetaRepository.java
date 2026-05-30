package com.informationretrival.intellisearchirplatform.repository;

import com.informationretrival.intellisearchirplatform.entity.ArticleMeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleMetaRepository extends JpaRepository<ArticleMeta, Integer> {

    Optional<ArticleMeta> findByDocumentFileName(String documentFileName);

    List<ArticleMeta> findByDocumentIdIn(List<Integer> documentIds);

    @Query("SELECT a FROM ArticleMeta a WHERE a.documentFileName IS NOT NULL")
    List<ArticleMeta> findAllWithDocumentFileName();
}
