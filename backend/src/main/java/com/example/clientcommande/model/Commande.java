package com.example.clientcommande.model;

import jakarta.persistence.*;
import lombok.*;

import javax.naming.Name;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor


public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    private String description;
    private Double montant;
    private LocalDate dateCommande;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;
}
