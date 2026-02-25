package com.example.clientcommande.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class CommandeDTO {

    @NotBlank(message = "La description est obligatoire")
    @Size(min = 3, max = 200, message = "La description doit contenire entre 3 et 200 caratères")
    private String description;

    @NotNull(message = "Le montant est obligatoire")
    @Positive(message = "Le montant doit etre positif")
    private Double montant;

    @NotNull(message = "La date de commande est obligatoire")
    private LocalDate dateCommande;

    @NotNull(message = "L'id du client est obligatoire")
    private Long clientId;
}
