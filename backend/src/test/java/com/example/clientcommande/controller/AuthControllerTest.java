package com.example.clientcommande.controller;

import com.example.clientcommande.controller.AuthController;
import com.example.clientcommande.model.AppUser;
import com.example.clientcommande.model.Role;
import com.example.clientcommande.repository.AppUserRepository;
import com.example.clientcommande.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean AuthenticationManager authenticationManager;
    @MockBean JwtService jwtService;
    @MockBean AppUserRepository userRepository;
    @MockBean PasswordEncoder passwordEncoder;

    @Test
    void login_shouldReturnTokens_whenOk() throws Exception {
        Mockito.when(authenticationManager.authenticate(any()))
                .thenAnswer(inv -> inv.getArgument(0));

        Mockito.when(jwtService.generateAccessToken("admin")).thenReturn("ACCESS");
        Mockito.when(jwtService.generateRefreshToken("admin")).thenReturn("REFRESH");

        String body = """
        {"username":"admin","password":"password123"}
        """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("ACCESS"))
                .andExpect(jsonPath("$.refreshToken").value("REFRESH"));
    }

    @Test
    void login_shouldFail_whenBadCredentials() throws Exception {
        Mockito.when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad"));

        String body = """
    {"username":"admin","password":"wrong"}
    """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(status().reason(org.hamcrest.Matchers.containsString("Identifiants invalides")));
    }


    @Test
    void register_shouldReturn201_andMessage_whenRoleOk() throws Exception {
        Mockito.when(userRepository.existsByUsername("ibrahim")).thenReturn(false);
        Mockito.when(passwordEncoder.encode("pass123")).thenReturn("ENC");
        Mockito.when(userRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        String body = """
        {"username":"ibrahim","password":"pass123","email":"a@b.com","role":"USER"}
        """;

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(content().string("Utilisateur créé avec succès. Vous pouvez maintenant vous connecter."));
    }

    @Test
    void register_shouldReturn400_whenRoleInvalid() throws Exception {
        Mockito.when(userRepository.existsByUsername("ibrahim")).thenReturn(false);

        String body = """
        {"username":"ibrahim","password":"pass123","email":"a@b.com","role":"BAD"}
        """;

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_shouldReturn409_whenUsernameExists() throws Exception {
        Mockito.when(userRepository.existsByUsername("admin")).thenReturn(true);

        String body = """
        {"username":"admin","password":"pass123","email":"a@b.com","role":"USER"}
        """;

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void registerAdmin_shouldReturnOk() throws Exception {
        Mockito.when(userRepository.existsByUsername("admin2")).thenReturn(false);
        Mockito.when(passwordEncoder.encode("pass123")).thenReturn("ENC");
        Mockito.when(userRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        String body = """
        {"username":"admin2","password":"pass123","email":"a@b.com","role":"USER"}
        """;

        mockMvc.perform(post("/auth/register-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("Administrateur créé avec succès !"));
    }

    @Test
    void refresh_shouldReturnNewAccessToken_whenRefreshValid() throws Exception {
        String refresh = "REFRESH_TOKEN";

        Mockito.when(jwtService.extractUsername(refresh)).thenReturn("admin");

        AppUser user = AppUser.builder()
                .id(1L)
                .username("admin")
                .password("x")
                .role(Role.ADMIN)
                .build();

        Mockito.when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        Mockito.when(jwtService.isTokenValid(eq(refresh), any())).thenReturn(true);
        Mockito.when(jwtService.generateAccessToken("admin")).thenReturn("NEW_ACCESS");

        String body = """
        {"refreshToken":"REFRESH_TOKEN"}
        """;

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("NEW_ACCESS"))
                .andExpect(jsonPath("$.refreshToken").value("REFRESH_TOKEN"));
    }

    @Test
    void refresh_shouldReturn401_whenRefreshInvalid() throws Exception {
        Mockito.when(jwtService.extractUsername("BAD")).thenThrow(new RuntimeException("bad"));

        String body = """
        {"refreshToken":"BAD"}
        """;

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }
}
