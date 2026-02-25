package com.example.clientcommande.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.clientcommande.model.AppUser;
import com.example.clientcommande.model.Role;
import com.example.clientcommande.repository.AppUserRepository;

@Configuration
public class AdminSeeder {

    @Bean
    public CommandLineRunner seedAdmin(AppUserRepository repo, PasswordEncoder encoder) {
        return args -> {

            String username = "admin";

            if (!repo.existsByUsername(username)) {

                AppUser admin = AppUser.builder()
                        .username(username)
                        .password(encoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .build();

                repo.save(admin);

                System.out.println("Admin bootstrap créé : admin / admin123");
            } else {
                System.out.println(" Admin déjà existant.");
            }
        };
    }
}