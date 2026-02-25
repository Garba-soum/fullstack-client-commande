package com.example.clientcommande.controller;

import com.example.clientcommande.model.Commande;
import com.example.clientcommande.security.JwtAuthenticationFilter;
import com.example.clientcommande.service.CommandeService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = CommandeController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtAuthenticationFilter.class
        )
)
@AutoConfigureMockMvc(addFilters = true)
@Import(CommandeControllerTest.TestSecurityConfig.class)
class CommandeControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    CommandeService commandeService;

    // 🔐 Configuration sécurité identique à ClientControllerTest
    @TestConfiguration
    @EnableMethodSecurity
    static class TestSecurityConfig {
        @Bean
        SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(csrf -> csrf.disable())
                    .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .exceptionHandling(ex ->
                            ex.authenticationEntryPoint(new HttpStatusEntryPoint(UNAUTHORIZED))
                    )
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                    .build();
        }
    }

    // ❌ Non authentifié → 401
    @Test
    void getCommandes_shouldReturn401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/commandes"))
                .andExpect(status().isUnauthorized());
    }

    // ✅ USER → OK pour GET
    @Test
    @WithMockUser(roles = "USER")
    void getCommandes_shouldReturnOk_forUser() throws Exception {
        Mockito.when(commandeService.obtenirToutesLesCommandes())
                .thenReturn(List.of(
                        new Commande(1L, "Commande 1", 12.5, LocalDate.now(), null)
                ));

        mockMvc.perform(get("/commandes"))
                .andExpect(status().isOk());
    }

    // ✅ ADMIN → OK pour POST
    @Test
    @WithMockUser(roles = "ADMIN")
    void postCommande_shouldReturnOk_forAdmin() throws Exception {
        Mockito.when(commandeService.creerCommande(any(Commande.class), eq(1L)))
                .thenAnswer(inv -> inv.getArgument(0));

        String body = """
                {
                  "description": "Achat produit",
                  "montant": 15.5,
                  "dateCommande": "2025-12-01",
                  "clientId": 1
                }
                """;

        mockMvc.perform(post("/commandes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    // ❌ USER → interdit pour POST
    @Test
    @WithMockUser(roles = "USER")
    void postCommande_shouldBeForbidden_forUser() throws Exception {
        String body = """
                {
                  "description": "Achat produit",
                  "montant": 15.5,
                  "dateCommande": "2025-12-01",
                  "clientId": 1
                }
                """;

        mockMvc.perform(post("/commandes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    // ❌ ADMIN mais données invalides → 400
    @Test
    @WithMockUser(roles = "ADMIN")
    void postCommande_shouldReturn400_whenValidationFails() throws Exception {
        String body = """
                {
                  "description": "",
                  "montant": -1,
                  "dateCommande": "2025-12-01",
                  "clientId": null
                }
                """;

        mockMvc.perform(post("/commandes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    // ✅ ADMIN → OK pour DELETE
    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCommande_shouldReturnOkMessage_forAdmin() throws Exception {
        Mockito.doNothing().when(commandeService).supprimerCommande(1L);

        mockMvc.perform(delete("/commandes/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Commande supprimée avec succès"));
    }
}
