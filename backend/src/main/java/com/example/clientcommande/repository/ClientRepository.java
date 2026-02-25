package com.example.clientcommande.repository;

import com.example.clientcommande.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {

}
