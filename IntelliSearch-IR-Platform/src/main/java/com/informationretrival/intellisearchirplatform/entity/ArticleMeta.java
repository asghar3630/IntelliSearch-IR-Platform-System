package com.informationretrival.intellisearchirplatform.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "research_articles_meta", schema = "documents")
@Getter
@Setter
@NoArgsConstructor
public class ArticleMeta {

    @Id
    @Column(name = "`documentID`", nullable = false)
    private Integer documentId;

    @Column(name = "`documentTitle`", nullable = false, length = 255)
    private String title;

    @Column(name = "`documentAuthor`", length = 255)
    private String authors;

    @Column(name = "`documentPublishingVenue`", length = 255)
    private String publishingVenue;

    @Column(name = "`documentPublishingYear`")
    private Short publishedYear;

    @Column(name = "`documentLink`", length = 255)
    private String documentLink;

    @Column(name = "`documentKeywords`", length = 255)
    private String keywords;

    @Column(name = "`researchArea`", length = 100)
    private String researchArea;

    @Column(name = "`documentSummary`", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "`documentAbstract`", columnDefinition = "TEXT")
    private String abstractText;

    @Column(name = "`documentFileName`", nullable = false, length = 255)
    private String documentFileName;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "`documentID`", referencedColumnName = "documentid", insertable = false, updatable = false)
    private ArticleDocument articleDocument;
}
