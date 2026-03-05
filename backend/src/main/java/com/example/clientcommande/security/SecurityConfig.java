package com.example.clientcommande.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Active CORS (nécessaire pour Angular)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login", "/auth/register",
                                "/auth/register-admin", "/auth/refresh").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS,
                                "/**").permitAll()
                        .requestMatchers("/auth/register-admin").hasRole("ADMIN")
                        .requestMatchers("/actuator/health")
                        .permitAll()

                        // Clients
                        .requestMatchers(HttpMethod.GET, "/clients/**").hasAnyAuthority("ROLE_USER","ROLE_ADMIN","USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/clients/**").hasAnyAuthority("ROLE_ADMIN","ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/clients/**").hasAnyAuthority("ROLE_ADMIN","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/clients/**").hasAnyAuthority("ROLE_ADMIN","ADMIN")

                        // Commandes
                        .requestMatchers(HttpMethod.GET, "/commandes/**").hasAnyAuthority("ROLE_USER","ROLE_ADMIN","USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/commandes/**").hasAnyAuthority("ROLE_ADMIN","ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/commandes/**").hasAnyAuthority("ROLE_ADMIN","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/commandes/**").hasAnyAuthority("ROLE_ADMIN","ADMIN")

                        .requestMatchers("/admin/**").hasAnyAuthority("ROLE_ADMIN","ADMIN")
                        .requestMatchers("/actuator/**").hasAnyAuthority("ROLE_ADMIN","ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Autorise Angular (localhost:4200) à appeler ton backend (localhost:8080)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Origine Angular/React
        config.setAllowedOriginPatterns(Arrays.asList(
               // "http://localhost:4200",
                //"http://localhost:4300",
                //"http://localhost:5173",
                //"http://15.237.159.190",
                //"http://15.237.159.190:80",
                //"http://15.237.159.190:4300"
                /*
                "http://localhost",
                "http://localhost:*",
                "http://15.237.159.190:*",
                "http://*.eu-west-3.compute.amazonaws.com:*"*/

                "http://15.237.159.190",        // IMPORTANT (sans port)
                "http://15.237.159.190:*",      // avec port (react 4300 etc.)
                "http://localhost",
                "http://localhost:*",
                "http://*.eu-west-3.compute.amazonaws.com",
                "http://*.eu-west-3.compute.amazonaws.com:*"

        ));

        // Méthodes autorisées
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Headers autorisés (Authorization indispensable pour JWT)
        config.setAllowedHeaders(Arrays.asList("*"));

        // Si tu utilises cookies/sessions plus tard (pas obligatoire ici)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
