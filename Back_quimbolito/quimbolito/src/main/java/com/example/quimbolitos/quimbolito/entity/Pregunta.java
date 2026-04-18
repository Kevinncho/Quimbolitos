package com.example.quimbolitos.quimbolito.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "preguntas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 300)
    private String enunciado;

    @Column(length = 500)
    private String descripcion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subtema_id", nullable = false)
    @ToString.Exclude
    private Subtema subtema;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activa = true;

    @Builder.Default
    @OneToMany(mappedBy = "pregunta")
    @ToString.Exclude
    private List<Respuesta> respuestas = new ArrayList<>();
}
