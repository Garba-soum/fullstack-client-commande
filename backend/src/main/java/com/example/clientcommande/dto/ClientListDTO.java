package com.example.clientcommande.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ClientListDTO {
    private Long id;
    private String nom;
    private String email;
    private String telephone;
    private long ordersCount;
}
