package com.informationretrival.intellisearchirplatform.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "research_articles_docuements", schema = "documents")
@Getter
@Setter
@NoArgsConstructor
public class ArticleDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "articleid")
    private Long articleId;

    @Column(name = "documentid", nullable = false, unique = true)
    private Integer documentId;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "document", columnDefinition = "BYTEA")
    private byte[] document;
}
