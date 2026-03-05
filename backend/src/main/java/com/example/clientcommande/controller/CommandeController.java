package com.example.clientcommande.controller;

import com.example.clientcommande.dto.CommandeDTO;
import com.example.clientcommande.model.Commande;
import com.example.clientcommande.service.CommandeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/commandes")
public class CommandeController {

    private final CommandeService commandeService;

    public CommandeController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    //  Lister toutes les commandes → USER + ADMIN
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN','USER','ADMIN')")
    @GetMapping
    public List<Commande> obtenirToutesLesCommandes() {
        return commandeService.obtenirToutesLesCommandes();
    }

    //  Récupérer une commande par ID → USER + ADMIN
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN','USER','ADMIN')")
    @GetMapping("/{id}")
    public Commande obtenirCommandeParId(@PathVariable Long id) {
        return commandeService.obtenirCommandeParId(id);
    }

    //  Créer une commande → ADMIN uniquement
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN')")
    @PostMapping
    public Commande ajouterCommande(@RequestBody @Valid CommandeDTO commandeDTO) {
        Commande commande = new Commande();
        commande.setDescription(commandeDTO.getDescription());
        commande.setMontant(commandeDTO.getMontant());
        commande.setDateCommande(commandeDTO.getDateCommande());

        return commandeService.creerCommande(commande, commandeDTO.getClientId());
    }

    //  Modifier une commande → ADMIN uniquement
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN')")
    @PutMapping("/{id}")
    public Commande modifierCommande(@PathVariable Long id,
                                     @Valid @RequestBody CommandeDTO dto) {
        return commandeService.mettreAJourCommande(id, dto);
    }

    @DeleteMapping("/{id}")

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN')")
    public ResponseEntity<?> supprimerCommande(@PathVariable Long id) {
        commandeService.supprimerCommande(id);
        return ResponseEntity.ok("Commande supprimée avec succès");
    }


}
