package com.example.quimbolitos.quimbolito.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ahorcado_partidas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AhorcadoPartida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pareja_id", nullable = false)
    private Pareja pareja;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creador_id", nullable = false)
    private Usuario creador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adivinador_id", nullable = false)
    private Usuario adivinador;

    @Column(nullable = false, length = 120)
    private String palabra;

    @Column(length = 240)
    private String pista;

    @Column(nullable = false, length = 120)
    private String letrasUsadas;

    @Column(nullable = false)
    private Integer errores;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPartidaAhorcado estado;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
}
