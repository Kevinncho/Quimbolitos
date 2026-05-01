package com.example.quimbolitos.quimbolito.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(length = 80)
    private String alias;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RolUsuario rol = RolUsuario.USER;

    @Column(length = 255)
    private String fotoPerfil;

    private LocalDate fechaNacimiento;

    @Column(length = 500)
    private String biografia;

    private Double latitud;

    private Double longitud;

    @Builder.Default
    @OneToMany(mappedBy = "usuario")
    @ToString.Exclude
    private List<Nota> notas = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "usuario")
    @ToString.Exclude
    private List<Respuesta> respuestas = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "usuario")
    @ToString.Exclude
    private List<Recuerdo> recuerdos = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "usuario")
    @ToString.Exclude
    private List<Cancion> canciones = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "usuario")
    @ToString.Exclude
    private List<RecuerdoMapa> recuerdosMapa = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "usuarioUno")
    @ToString.Exclude
    private List<Pareja> parejasIniciadas = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "usuarioDos")
    @ToString.Exclude
    private List<Pareja> parejasRecibidas = new ArrayList<>();
}
