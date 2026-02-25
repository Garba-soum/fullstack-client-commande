package com.example.clientcommande.service;

import com.example.clientcommande.dto.ClientDTO;
import com.example.clientcommande.exception.ClientNotFoundException;
import com.example.clientcommande.model.Client;
import com.example.clientcommande.repository.ClientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ClientService clientService;

    @Test
    void creerClient_shouldSaveAndReturnClient() {
        // Arrange
        Client input = new Client(null, "Ibrahim", "ibrahim@test.com", "0600000000", null);
        Client saved = new Client(1L, "Ibrahim", "ibrahim@test.com", "0600000000", null);
        when(clientRepository.save(input)).thenReturn(saved);

        // Act
        Client result = clientService.creerClient(input);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Ibrahim", result.getNom());
        verify(clientRepository).save(input);
    }

    @Test
    void obtenirTousLesClients_shouldReturnAllClients() {
        // Arrange
        when(clientRepository.findAll()).thenReturn(List.of(
                new Client(1L, "A", "a@b.com", "0600", null),
                new Client(2L, "B", "b@b.com", "0700", null)
        ));

        // Act
        List<Client> result = clientService.obtenirTousLesClients();

        // Assert
        assertEquals(2, result.size());
        verify(clientRepository).findAll();
    }

    @Test
    void obtenirClientParId_shouldReturnClient_whenFound() {
        // Arrange
        Client client = new Client(1L, "A", "a@b.com", "0600", null);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));

        // Act
        Client result = clientService.obtenirClientParId(1L);

        // Assert
        assertEquals(1L, result.getId());
        verify(clientRepository).findById(1L);
    }

    @Test
    void obtenirClientParId_shouldThrow_whenNotFound() {
        // Arrange
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(ClientNotFoundException.class, () -> clientService.obtenirClientParId(99L));
        verify(clientRepository).findById(99L);
    }

    @Test
    void mettreAjourClient_shouldUpdateFieldsAndSave() {
        // Arrange
        Client existing = new Client(1L, "Old", "old@test.com", "0000", null);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(existing));

        ClientDTO dto = new ClientDTO("New", "new@test.com", "0600000000");

        // On capture l'objet passé à save pour vérifier les champs
        ArgumentCaptor<Client> captor = ArgumentCaptor.forClass(Client.class);
        when(clientRepository.save(any(Client.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Client result = clientService.mettreAjourClient(1L, dto);

        // Assert
        verify(clientRepository).findById(1L);
        verify(clientRepository).save(captor.capture());

        Client saved = captor.getValue();
        assertEquals("New", saved.getNom());
        assertEquals("new@test.com", saved.getEmail());
        assertEquals("0600000000", saved.getTelephone());

        assertEquals("New", result.getNom());
    }

    @Test
    void mettreAjourClient_shouldThrow_whenClientNotFound() {
        // Arrange
        when(clientRepository.findById(1L)).thenReturn(Optional.empty());
        ClientDTO dto = new ClientDTO("New", "new@test.com", "0600000000");

        // Act + Assert
        assertThrows(ClientNotFoundException.class, () -> clientService.mettreAjourClient(1L, dto));
        verify(clientRepository).findById(1L);
        verify(clientRepository, never()).save(any());
    }

    @Test
    void supprimerClient_shouldDelete_whenFound() {
        // Arrange
        Client existing = new Client(1L, "A", "a@b.com", "0600", null);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(existing));

        // Act
        clientService.supprimerClient(1L);

        // Assert
        verify(clientRepository).findById(1L);
        verify(clientRepository).delete(existing);
    }

    @Test
    void supprimerClient_shouldThrow_whenNotFound() {
        // Arrange
        when(clientRepository.findById(1L)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(ClientNotFoundException.class, () -> clientService.supprimerClient(1L));
        verify(clientRepository).findById(1L);
        verify(clientRepository, never()).delete(any());
    }
}
