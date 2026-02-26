package com.example.clientcommande.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
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
        ReflectionTestUtils.setField(jwtService, "accessExpirationMs", 60_000L);    // 1 min
        ReflectionTestUtils.setField(jwtService, "refreshExpirationMs", 120_000L); // 2 min
    }

    private UserDetails user(String username, String role) {
        return User.withUsername(username)
                .password("x")
                .roles(role)
                .build();
    }

    @Test
    void generateAccessToken_thenExtractUsername_shouldMatch() {
        UserDetails ud = user("admin", "ADMIN");

        String token = jwtService.generateAccessToken(ud);
        assertNotNull(token);

        assertEquals("admin", jwtService.extractUsername(token));
    }

    @Test
    void accessAndRefreshTokens_shouldHaveDifferentExpirations() {
        UserDetails ud = user("admin", "ADMIN");

        String access = jwtService.generateAccessToken(ud);
        String refresh = jwtService.generateRefreshToken(ud);

        Date expAccess = jwtService.extractClaim(access, Claims::getExpiration);
        Date expRefresh = jwtService.extractClaim(refresh, Claims::getExpiration);

        assertTrue(expRefresh.after(expAccess));
    }

    @Test
    void isTokenValid_shouldReturnTrue_forMatchingUser() {
        UserDetails ud = user("admin", "ADMIN");
        String token = jwtService.generateAccessToken(ud);

        assertTrue(jwtService.isTokenValid(token, ud));
    }

    @Test
    void isTokenValid_shouldReturnFalse_forDifferentUser() {
        UserDetails udAdmin = user("admin", "ADMIN");
        String token = jwtService.generateAccessToken(udAdmin);

        UserDetails udOther = user("other", "USER");
        assertFalse(jwtService.isTokenValid(token, udOther));
    }
}