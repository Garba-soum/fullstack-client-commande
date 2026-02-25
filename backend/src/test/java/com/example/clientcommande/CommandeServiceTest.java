package com.example.clientcommande;

import com.example.clientcommande.exception.ClientNotFoundException;
import com.example.clientcommande.model.Client;
import com.example.clientcommande.model.Commande;
import com.example.clientcommande.repository.ClientRepository;
import com.example.clientcommande.repository.CommandeRepository;
import com.example.clientcommande.service.CommandeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommandeServiceTest {

    @Mock
    private CommandeRepository commandeRepository;

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private CommandeService commandeService;

    @Test
    void creerCommande_shouldAttachClient_andSave() {
        Client client = new Client();
        client.setId(10L);

        Commande commande = new Commande();
        commande.setDescription("Test");
        commande.setMontant(99.0);
        commande.setDateCommande(LocalDate.now());

        when(clientRepository.findById(10L)).thenReturn(Optional.of(client));
        when(commandeRepository.save(any(Commande.class))).thenAnswer(inv -> inv.getArgument(0));

        Commande saved = commandeService.creerCommande(commande, 10L);

        assertNotNull(saved);
        assertNotNull(saved.getClient());
        assertEquals(10L, saved.getClient().getId());
        verify(commandeRepository, times(1)).save(any(Commande.class));
    }

    @Test
    void creerCommande_shouldThrow_whenClientNotFound() {
        Commande commande = new Commande();
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ClientNotFoundException.class, () -> commandeService.creerCommande(commande, 99L));
        verify(commandeRepository, never()).save(any());
    }
}
