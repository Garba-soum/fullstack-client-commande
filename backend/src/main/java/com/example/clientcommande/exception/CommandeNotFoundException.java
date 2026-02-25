package com.example.clientcommande.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class CommandeNotFoundException extends RuntimeException {

    public CommandeNotFoundException(Long id) {
        super("Commande introuvable avec id : " + id);
    }
}
