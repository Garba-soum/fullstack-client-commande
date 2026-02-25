package com.example.clientcommande.service;

import com.example.clientcommande.dto.ClientListDTO;
import com.example.clientcommande.exception.ClientNotFoundException;
import com.example.clientcommande.dto.ClientDTO;
import com.example.clientcommande.model.Client;
import com.example.clientcommande.repository.ClientRepository;
import com.example.clientcommande.repository.CommandeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {
    private final ClientRepository clientRepository;
    private final CommandeRepository commandeRepository;

    // Injection par constructeur
    public ClientService(ClientRepository clientRepository, CommandeRepository commandeRepository) {
        this.clientRepository = clientRepository;
        this.commandeRepository = commandeRepository;
    }

    //Créer un client
    public Client creerClient(Client client){
        return clientRepository.save(client);
    }

    //Lister tous les clients
    public List<Client> obtenirTousLesClients(){
        return clientRepository.findAll();
    }

    //Récupérer un client par son id ou erreur si introuvable
    public Client obtenirClientParId(Long id){
        return clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException(id));
    }

    //Modifier un client
    public Client mettreAjourClient(Long id, ClientDTO dto){
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException(id));

        client.setNom(dto.getNom());
        client.setEmail(dto.getEmail());
        client.setTelephone(dto.getTelephone());

        return clientRepository.save(client);
    }


    public void supprimerClient(Long id) {

        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ClientNotFoundException(id));

        clientRepository.delete(client);
    }

    //Obtenir les client avec le nombre
    public List<ClientListDTO> obtenirTousLesClientsAvecCount() {
        List<Client> clients = clientRepository.findAll();

        return clients.stream()
                .map(c -> new ClientListDTO(
                        c.getId(),
                        c.getNom(),
                        c.getEmail(),
                        c.getTelephone(),
                        commandeRepository.countByClientId(c.getId())
                ))
                .toList();
    }




}
