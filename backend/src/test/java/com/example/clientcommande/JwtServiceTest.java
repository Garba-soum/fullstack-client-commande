package com.example.clientcommande;

import com.example.clientcommande.security.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        // HS256 => clé >= 32 bytes. Ici 32 chars ASCII.
        ReflectionTestUtils.setField(jwtService, "secret", "01234567890123456789012345678901");
        ReflectionTestUtils.setField(jwtService, "accessExpirationMs", 60_000L);   // 1 min
        ReflectionTestUtils.setField(jwtService, "refreshExpirationMs", 120_000L); // 2 min
    }

    @Test
    void generateAccessToken_thenExtractUsername_shouldMatch() {
        String token = jwtService.generateAccessToken("admin");
        assertNotNull(token);

        assertEquals("admin", jwtService.extractUsername(token));
    }

    @Test
    void accessAndRefreshTokens_shouldHaveDifferentExpirations() {
        String access = jwtService.generateAccessToken("admin");
        String refresh = jwtService.generateRefreshToken("admin");

        Date expAccess = jwtService.extractClaim(access, Claims::getExpiration);
        Date expRefresh = jwtService.extractClaim(refresh, Claims::getExpiration);

        assertTrue(expRefresh.after(expAccess));
    }

    @Test
    void isTokenValid_shouldReturnTrue_forMatchingUser() {
        String token = jwtService.generateAccessToken("admin");

        org.springframework.security.core.userdetails.UserDetails ud =
                org.springframework.security.core.userdetails.User
                        .withUsername("admin")
                        .password("x")
                        .roles("ADMIN")
                        .build();

        assertTrue(jwtService.isTokenValid(token, ud));
    }

    @Test
    void isTokenValid_shouldReturnFalse_forDifferentUser() {
        String token = jwtService.generateAccessToken("admin");

        org.springframework.security.core.userdetails.UserDetails ud =
                org.springframework.security.core.userdetails.User
                        .withUsername("other")
                        .password("x")
                        .roles("USER")
                        .build();

        assertFalse(jwtService.isTokenValid(token, ud));
    }
}
