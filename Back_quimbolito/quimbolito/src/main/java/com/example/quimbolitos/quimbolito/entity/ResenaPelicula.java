package com.example.quimbolitos.quimbolito.entity;

import java.time.LocalDateTime;

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
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(
        name = "resenas_peliculas",
        uniqueConstraints = @UniqueConstraint(name = "uk_resena_pelicula_usuario", columnNames = {"pelicula_id", "usuario_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class ResenaPelicula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pelicula_id", nullable = false)
    @ToString.Exclude
    private Pelicula pelicula;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @ToString.Exclude
    private Usuario usuario;
}
