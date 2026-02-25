import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

import { ClientService } from '../../services/client.service';
import { ToastService } from '../../services/toast.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-clients-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients-edit.html',
  styleUrls: ['./clients-edit.css']
})
export class ClientsEdit implements OnInit {

  id: number = 0;

  nom: string = '';
  email: string = '';
  telephone: string = '';

  loading: boolean = false;  // ✅ chargement du client
  saving: boolean = false;   // ✅ enregistrement
  errorMessage: string = ''; // ✅ affichage page (en plus du toast)

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    public toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : 0;

    if (!this.id) {
      this.toast.showError('ID client invalide.');
      this.router.navigateByUrl('/clients');
      return;
    }

    this.loadClient();
  }

  loadClient(): void {
    this.loading = true;
    this.errorMessage = '';

    this.clientService.getClientById(this.id)
      .pipe(
        timeout(5000),
        catchError((err: any) => {
          console.error('getClientById error:', err);

          if (err && err.status === 401) {
            this.toast.showError('Session expirée. Reconnecte-toi.');
            this.router.navigateByUrl('/login');
          } else if (err && err.status === 403) {
            this.toast.showError('Accès refusé (ADMIN requis).');
            this.router.navigateByUrl('/clients');
          } else if (err && err.status === 404) {
            this.toast.showError('Client introuvable.');
            this.router.navigateByUrl('/clients');
          } else {
            this.toast.showError('Erreur lors du chargement du client.');
            this.errorMessage = 'Erreur lors du chargement du client.';
          }

          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((client: Client | null) => {
        if (!client) return;

        this.nom = client.nom || '';
        this.email = client.email || '';
        this.telephone = client.telephone || '';
      });
  }

  submit(form: any): void {
    if (form.invalid) {
      this.toast.showError('Veuillez corriger les champs du formulaire.');
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    this.clientService.updateClient(this.id, {
      nom: this.nom,
      email: this.email,
      telephone: this.telephone
    })
    .pipe(
      timeout(5000),
      catchError((err: any) => {
        console.error('updateClient error:', err);

        if (err && err.status === 401) {
          this.toast.showError('Session expirée. Reconnecte-toi.');
          this.router.navigateByUrl('/login');
        } else if (err && err.status === 403) {
          this.toast.showError('Accès refusé (ADMIN requis).');
          this.errorMessage = 'Accès refusé (ADMIN requis).';
        } else if (err && err.status === 400) {
          this.toast.showError('Données invalides.');
          this.errorMessage = 'Données invalides.';
        } else {
          this.toast.showError('Erreur lors de la modification.');
          this.errorMessage = 'Erreur lors de la modification.';
        }

        return of(null);
      }),
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe((res: any) => {
      if (res === null) return;

      this.toast.showSuccess('Client modifié avec succès.');
      this.router.navigateByUrl('/clients');
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/clients');
  }
}
