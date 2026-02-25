import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { CommandeService } from '../../services/commandes.service';
import { ToastService } from '../../services/toast.service';

import { finalize, catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-commandes-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commande-add.html',
  styleUrls: ['./commande-add.css']
})
export class CommandesAdd implements OnInit {

  description: string = '';
  montant: number | null = null;
  dateCommande: string = '';      // yyyy-mm-dd
  clientId: number | null = null;

  clients: Client[] = [];

  loading: boolean = false; // chargement clients
  saving: boolean = false;  // submit
  errorMessage: string = '';

  constructor(
    private commandeService: CommandeService,
    private clientService: ClientService,
    private router: Router,
    public toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  private loadClients(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clientService.getClients().pipe(
      timeout(5000),
      catchError((err: any) => {
        console.error('getClients (for add commande) error:', err);

        if (err && (err.status === 401 || err.status === 403)) {
          this.errorMessage = "Session expirée ou accès refusé. Reconnecte-toi.";
          this.toast.showError(this.errorMessage);
          this.router.navigateByUrl('/login');
        } else {
          this.errorMessage = "Impossible de charger la liste des clients.";
          this.toast.showError(this.errorMessage);
        }

        return of([] as Client[]);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((data: Client[]) => {
      this.clients = data || [];
    });
  }

  submit(form: any): void {
    this.errorMessage = '';

    if (form && form.invalid) {
      this.toast.showError('Veuillez corriger les champs du formulaire.');
      return;
    }

    // sécurité en plus
    if (!this.description || this.montant === null || !this.dateCommande || this.clientId === null) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      this.toast.showError(this.errorMessage);
      return;
    }

    this.saving = true;

    const payload = {
      description: this.description,
      montant: Number(this.montant),
      dateCommande: this.dateCommande,
      clientId: Number(this.clientId)
    };

    this.commandeService.addCommande(payload).pipe(
      timeout(5000),
      catchError((err: HttpErrorResponse) => {
        console.error('addCommande error:', err);

        if (err.status === 401) {
          this.errorMessage = 'Session expirée. Reconnecte-toi.';
          this.toast.showError(this.errorMessage);
          this.router.navigateByUrl('/login');
        } else if (err.status === 403) {
          this.errorMessage = 'Accès refusé (ADMIN requis).';
          this.toast.showError(this.errorMessage);
        } else if (err.status === 400) {
          this.errorMessage = 'Données invalides.';
          this.toast.showError(this.errorMessage);
        } else {
          this.errorMessage = "Erreur lors de l'ajout de la commande.";
          this.toast.showError(this.errorMessage);
        }

        return of(null);
      }),
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe((res: any) => {
      if (res === null) return;

      this.toast.showSuccess('Commande ajoutée avec succès.');
      this.router.navigateByUrl('/commandes');
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/commandes');
  }
}
