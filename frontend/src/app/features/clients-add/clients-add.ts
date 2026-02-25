import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ClientService } from '../../services/client.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-clients-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients-add.html',
  styleUrls: ['./clients-add.css']
})
export class ClientsAdd {

  nom: string = '';
  email: string = '';
  telephone: string = '';

  loading: boolean = false;

  constructor(
    private clientService: ClientService,
    private router: Router,
    public toast: ToastService
  ) {}

  submit(form: any): void {
    if (form.invalid) {
      this.toast.showError('Veuillez remplir correctement le formulaire.');
      return;
    }

    this.loading = true;

    this.clientService.addClient({
      nom: this.nom,
      email: this.email,
      telephone: this.telephone
    }).subscribe({
      next: () => {
        this.loading = false;

        // ✅ Toast succès
        this.toast.showSuccess('Client ajouté avec succès.');

        // ✅ Retour à la liste
        this.router.navigateByUrl('/clients');
      },
      error: (err: any) => {
        console.error('addClient error:', err);
        this.loading = false;

        if (err && err.status === 401) {
          this.toast.showError('Session expirée. Reconnecte-toi.');
          this.router.navigateByUrl('/login');
        } else if (err && err.status === 403) {
          this.toast.showError('Accès refusé (ADMIN requis).');
        } else if (err?.error) {
          // message backend s’il existe
          this.toast.showError(err.error);
        } else {
          this.toast.showError("Erreur lors de l'ajout du client.");
        }
      }
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/clients');
  }
}
