package com.example.clientcommande.repository;

import com.example.clientcommande.model.Commande;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommandeRepository extends JpaRepository<Commande, Long> {
    long countByClientId(Long clientId);

}
