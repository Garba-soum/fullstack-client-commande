package com.example.clientcommande;

import com.example.clientcommande.controller.ClientController;
import com.example.clientcommande.model.Client;
import com.example.clientcommande.security.JwtAuthenticationFilter;
import com.example.clientcommande.service.ClientService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = ClientController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtAuthenticationFilter.class // ✅ IMPORTANT
        )
)
@AutoConfigureMockMvc(addFilters = true)
@Import(ClientControllerTest.TestSecurityConfig.class)
class ClientControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    ClientService clientService;

    @TestConfiguration
    @EnableMethodSecurity // ✅ pour @PreAuthorize
    static class TestSecurityConfig {
        @Bean
        SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(csrf -> csrf.disable())
                    .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    // ✅ API -> non authentifié = 401 (pas 403)
                    .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(UNAUTHORIZED)))
                    // ✅ on exige une authentification, et @PreAuthorize gère les rôles
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                    .build();
        }
    }

    @Test
    void getClients_shouldReturn401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/clients"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void getClients_shouldReturnOk_forUser() throws Exception {
        Mockito.when(clientService.obtenirTousLesClients())
                .thenReturn(List.of(new Client(1L, "A", "a@b.com", "0600", null)));

        mockMvc.perform(get("/clients"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void postClient_shouldReturnOk_forAdmin() throws Exception {
        Mockito.when(clientService.creerClient(any(Client.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        String body = "{\"nom\":\"Ibrahim\",\"email\":\"ibrahim@test.com\",\"telephone\":\"0600000000\"}";

        mockMvc.perform(post("/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void postClient_shouldBeForbidden_forUser() throws Exception {
        String body = "{\"nom\":\"Ibrahim\",\"email\":\"ibrahim@test.com\",\"telephone\":\"0600000000\"}";

        mockMvc.perform(post("/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void postClient_shouldReturn400_whenValidationFails() throws Exception {
        String body = "{\"nom\":\"\",\"email\":\"bad\",\"telephone\":\"1\"}";

        mockMvc.perform(post("/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteClient_shouldReturnOkMessage_forAdmin() throws Exception {
        Mockito.doNothing().when(clientService).supprimerClient(1L);

        mockMvc.perform(delete("/clients/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Client supprimé avec succès"));
    }
}
