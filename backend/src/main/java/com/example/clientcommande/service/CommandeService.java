package com.example.clientcommande.service;

import com.example.clientcommande.exception.ClientNotFoundException;
import com.example.clientcommande.exception.CommandeNotFoundException;
import com.example.clientcommande.model.Client;
import com.example.clientcommande.model.Commande;
import com.example.clientcommande.dto.CommandeDTO;
import com.example.clientcommande.repository.ClientRepository;
import com.example.clientcommande.repository.CommandeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommandeService {
    private final CommandeRepository commandeRepository;
    private final ClientRepository clientRepository;

    public CommandeService(CommandeRepository commandeRepository, ClientRepository clientRepository) {
        this.commandeRepository = commandeRepository;
        this.clientRepository = clientRepository;
    }

    //Créer une commande associée à un client
    public Commande creerCommande (Commande commande, Long clientId){
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ClientNotFoundException(clientId));

        //Associer la commande au client
        commande.setClient(client);

        return commandeRepository.save(commande);
    }

    //Lister toutes les commande
    public List<Commande> obtenirToutesLesCommandes(){
        return commandeRepository.findAll();
    }

    public Commande obtenirCommandeParId(Long id){
        return commandeRepository.findById(id)
                .orElseThrow(() -> new CommandeNotFoundException(id));
    }

    public Commande mettreAJourCommande(Long id, CommandeDTO dto) {

        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new CommandeNotFoundException(id));

        // Mise à jour des champs
        commande.setDescription(dto.getDescription());
        commande.setMontant(dto.getMontant());
        commande.setDateCommande(dto.getDateCommande());

        // Mise à jour du client si besoin
        if (dto.getClientId() != null) {
            Client client = clientRepository.findById(dto.getClientId())
                    .orElseThrow(() -> new ClientNotFoundException(dto.getClientId()));
            commande.setClient(client);
        }

        return commandeRepository.save(commande);
    }


    public void supprimerCommande(Long id){
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() ->new CommandeNotFoundException(id));

        commandeRepository.delete(commande);
    }

}
