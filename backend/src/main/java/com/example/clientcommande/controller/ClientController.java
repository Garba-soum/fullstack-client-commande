package com.example.clientcommande.controller;

import com.example.clientcommande.dto.ClientDTO;
import com.example.clientcommande.dto.ClientListDTO;
import com.example.clientcommande.model.Client;
import com.example.clientcommande.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

@RestController
@RequestMapping("/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    //  Lister tous les clients → USER + ADMIN
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN','USER','ADMIN')")
    @GetMapping
    public List<ClientListDTO> obtenirTousLesClients() {
        return clientService.obtenirTousLesClientsAvecCount();
    }

    //  Récupérer un client par ID → USER + ADMIN
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN','USER','ADMIN')")
    @GetMapping("/{id}")
    public Client obtenirClientParId(@PathVariable Long id) {
        return clientService.obtenirClientParId(id);
    }

    //  Créer un client → ADMIN uniquement
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN')")
    @PostMapping
    public Client ajouterClient(@RequestBody @Valid ClientDTO clientDTO) {
        Client client = new Client();
        client.setNom(clientDTO.getNom());
        client.setEmail(clientDTO.getEmail());
        client.setTelephone(clientDTO.getTelephone());

        return clientService.creerClient(client);
    }

    //  Modifier un client → ADMIN uniquement
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN')")
    @PutMapping("/{id}")
    public Client modifierClient(@PathVariable Long id,
                                 @Valid @RequestBody ClientDTO clientDTO) {
        return clientService.mettreAjourClient(id, clientDTO);
    }

    @DeleteMapping("/{id}")

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN')")
    public ResponseEntity<?> supprimerClient(@PathVariable Long id) {
        clientService.supprimerClient(id);
        return ResponseEntity.ok("Client supprimé avec succès");
    }



    @GetMapping("/debug/auth")
    public String debugAuth(Authentication auth) {
        if (auth == null) return "NO_AUTH";

        StringBuilder sb = new StringBuilder();
        sb.append("name=").append(auth.getName()).append(" | authorities=");

        for (GrantedAuthority a : auth.getAuthorities()) {
            sb.append(a.getAuthority()).append(" ");
        }

        return sb.toString();
    }


}
