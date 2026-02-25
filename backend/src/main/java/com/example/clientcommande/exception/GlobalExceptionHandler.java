package com.example.clientcommande.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ClientNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleClientNotFound(ClientNotFoundException ex){

        Map<String, String> body = new HashMap<>();
        body.put("message", ex.getMessage());

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CommandeNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleCommandeNotFound(CommandeNotFoundException ex) {
        Map<String, String> body = new HashMap<String, String>();
        body.put("message", ex.getMessage());
        return new ResponseEntity<Map<String, String>>(body, HttpStatus.NOT_FOUND);
    }
}
