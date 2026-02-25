import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    public toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    if (this.loading) return; // Prévenir les doubles soumissions
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      this.cdr.detectChanges(); // forcer la détection de changement
      return;
    }

    this.loading = true;

    this.auth.register(this.username, this.password, this.email)
      .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges(); //  force UI update (débloque "Création...")
      })
    )
      .subscribe({
        next: () => {
          this.toast.showSuccess('Compte créé. Tu peux te connecter.');
          this.cdr.detectChanges(); // forcer la détection de changement
          this.router.navigateByUrl('/login');
        },
        error: (err: any) => {
        if (err && err.status === 409) {
          this.errorMessage = "Nom d'utilisateur déjà utilisé.";
        } else if (err && err.status === 400) {
          this.errorMessage = 'Données invalides.';
        } else {
          this.errorMessage = 'Erreur serveur. Réessaie plus tard.';
        }

        this.toast.showError(this.errorMessage);
        this.cdr.detectChanges(); // affiche le message immédiatement
      }
    });
  }
}
