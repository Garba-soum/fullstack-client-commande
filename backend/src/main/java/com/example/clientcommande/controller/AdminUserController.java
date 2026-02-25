package com.example.clientcommande.controller;

import com.example.clientcommande.dto.UserDTO;
import com.example.clientcommande.model.AppUser;
import com.example.clientcommande.repository.AppUserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final AppUserRepository userRepository;

    public AdminUserController(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    //  Lister les utilisateurs (ADMIN uniquement)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDTO> listerUtilisateurs() {

        List<AppUser> users = userRepository.findAll();
        List<UserDTO> result = new ArrayList<UserDTO>();

        for (AppUser u : users) {
            result.add(new UserDTO(
                    u.getId(),
                    u.getUsername(),
                    u.getRole().name() 
            ));
        }

        return result;
    }



    //  Supprimer un utilisateur (ADMIN uniquement)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String supprimerUtilisateur(@PathVariable Long id) {

        if (!userRepository.existsById(id)) {
            return "Utilisateur introuvable.";
        }

        userRepository.deleteById(id);
        return "Utilisateur supprimé avec succès.";
    }
}
