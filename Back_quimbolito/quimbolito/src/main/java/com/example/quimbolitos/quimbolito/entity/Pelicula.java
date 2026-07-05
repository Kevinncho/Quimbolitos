package com.example.quimbolitos.quimbolito.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "peliculas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Pelicula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 140)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, length = 500)
    private String linkVer;

    @Column(length = 255)
    private String fotoUrl;

    @Builder.Default
    @Column(nullable = false)
    private Boolean visto = false;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "pelicula_generos", joinColumns = @JoinColumn(name = "pelicula_id"))
    @Column(name = "genero", nullable = false, length = 40)
    @Enumerated(EnumType.STRING)
    private Set<GeneroPelicula> generos = new LinkedHashSet<>();

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @ToString.Exclude
    private Usuario usuario;

    @Builder.Default
    @OneToMany(mappedBy = "pelicula", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<ResenaPelicula> resenas = new ArrayList<>();
}
