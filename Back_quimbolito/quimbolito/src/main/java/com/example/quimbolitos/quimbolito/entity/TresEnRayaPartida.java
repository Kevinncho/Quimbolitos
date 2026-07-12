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
@Table(name = "tres_en_raya_partidas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TresEnRayaPartida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pareja_id", nullable = false)
    private Pareja pareja;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jugador_x_id", nullable = false)
    private Usuario jugadorX;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jugador_o_id", nullable = false)
    private Usuario jugadorO;

    @Column(nullable = false, length = 9)
    private String tablero;

    @Column(nullable = false, length = 1)
    private String turnoActual;

    @Column(nullable = false)
    private Integer marcadorX;

    @Column(nullable = false)
    private Integer marcadorO;

    @Column(nullable = false)
    private Integer empates;

    @Column(nullable = false)
    private Integer rondasJugadas;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPartidaTresEnRaya estado;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;
}
