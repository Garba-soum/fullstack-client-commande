import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';

import { finalize, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ FormsModule ajouté
  templateUrl: './clients.html',
  styleUrls: ['./clients.css']
})
export class Clients implements OnInit {

  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm: string = '';

  loading: boolean = false;
  errorMessage: string = '';
  isAdmin: boolean = false;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    public toast: ToastService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clientService.getClients()
      .pipe(
        timeout(5000),
        catchError((err: any) => {
          console.error('getClients error:', err);

          if (err && err.status === 401) {
            this.errorMessage = 'Session expirée. Reconnecte-toi.';
            this.router.navigateByUrl('/login');
          } else if (err && err.status === 403) {
            this.errorMessage = 'Accès refusé.';
          } else {
            this.errorMessage = 'Erreur lors du chargement des clients.';
          }

          return of([] as Client[]);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data: Client[]) => {
        this.clients = data || [];
        this.filterClients(); // ✅ applique le filtre courant
      });
  }

  filterClients(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredClients = this.clients;
      return;
    }

    this.filteredClients = this.clients.filter((c: Client) => {
      const nom = (c.nom || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      return nom.includes(term) || email.includes(term);
    });
  }

  deleteClient(id: number): void {
    if (!confirm('Supprimer ce client ?')) return;

    this.clientService.deleteClient(id).subscribe({
      next: () => {
        const idNum = Number(id);

        // ✅ update local
        this.clients = this.clients.filter((c: Client) => Number(c.id) !== idNum);

        // ✅ update filtered list (sinon tu ne le vois pas)
        this.filterClients();

        this.toast.showSuccess('Client supprimé.');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('deleteClient error:', err);

        if (err && err.status === 401) {
          this.toast.showError('Session expirée. Reconnecte-toi.');
          this.router.navigateByUrl('/login');
        } else if (err && err.status === 403) {
          this.toast.showError('Accès refusé (ADMIN requis).');
        } else {
          this.toast.showError('Erreur lors de la suppression.');
        }
      }
    });
  }

  goToAdd(): void {
    this.router.navigateByUrl('/clients/add');
  }

  goToEdit(id: number): void {
    this.router.navigateByUrl('/clients/' + id + '/edit');
  }

  goToClientOrders(clientId: number): void {
  this.router.navigate(['/commandes'], { queryParams: { clientId: clientId } });
}
}
