package com.example.quimbolitos.quimbolito.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "preguntas_visual", uniqueConstraints = {
        @UniqueConstraint(columnNames = "pregunta_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class VisualPregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pregunta_id", nullable = false)
    @ToString.Exclude
    private Pregunta pregunta;

    @Column(length = 200)
    private String opcionALabel;

    @Column(length = 500)
    private String opcionASrc;

    @Column(length = 300)
    private String opcionAAlt;

    @Column
    private Integer opcionAPositionY;

    @Column(length = 200)
    private String opcionBLabel;

    @Column(length = 500)
    private String opcionBSrc;

    @Column(length = 300)
    private String opcionBAlt;

    @Column
    private Integer opcionBPositionY;
}
