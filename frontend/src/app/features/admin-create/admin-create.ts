import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-create.html',
  styleUrls: ['./admin-create.css']
})
export class AdminCreate {
  username = '';
  password = '';
  confirmPassword = '';
  email = '';

  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;

    this.auth.registerAdmin(this.username, this.password, this.email)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.toast.showSuccess('Admin créé avec succès.');
          this.router.navigateByUrl('/clients');
        },
        error: (err: any) => {
          // ✅ 409 username déjà utilisé
          if (err && err.status === 409) {
            this.errorMessage = "Nom d'utilisateur déjà utilisé.";
            this.toast.showError(this.errorMessage);
            return;
          }

          // ✅ 401/403 => pas autorisé (token absent / pas admin)
          if (err && (err.status === 401 || err.status === 403)) {
            this.errorMessage = "Accès refusé. ADMIN requis.";
            this.toast.showError(this.errorMessage);
            this.router.navigateByUrl('/clients');
            return;
          }

          this.errorMessage = "Erreur serveur. Réessaie plus tard.";
          this.toast.showError(this.errorMessage);
        }
      });
  }
}
