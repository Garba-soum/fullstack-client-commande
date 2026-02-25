import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, switchMap, timeout, map } from 'rxjs/operators';

import { CommandeService } from '../../services/commandes.service';
import { ClientService } from '../../services/client.service';
import { ToastService } from '../../services/toast.service';

import { Commande } from '../../models/commande.model';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-commandes-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commandes-edit.html',
  styleUrls: ['./commandes-edit.css']
})
export class CommandesEdit implements OnInit {

  id: number = 0;

  description: string = '';
  montant: number | null = null;
  dateCommande: string = '';
  clientId: number | null = null;
  

  clients: Client[] = [];

  // ✅ séparation
  loading: boolean = false; // chargement page
  saving: boolean = false;  // submit

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService,
    private clientService: ClientService,
    public toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : 0;

    if (!this.id) {
      this.toast.showError('ID commande invalide.');
      this.router.navigateByUrl('/commandes');
      return;
    }

    this.loadPage();
  }

  private loadPage(): void {
    this.loading = true;

    // ✅ charge clients puis commande (sans subscribe imbriqué)
    this.clientService.getClients().pipe(
      timeout(5000),
      catchError((err: any) => {
        console.error('getClients error:', err);
        this.toast.showError('Impossible de charger la liste des clients.');
        return of([] as Client[]);
      }),
      switchMap((clients: Client[]) => {
        this.clients = clients || [];
        return this.commandeService.getCommandeById(this.id).pipe(timeout(5000));
      }),
      catchError((err: any) => {
        console.error('getCommandeById error:', err);

        if (err && err.status === 401) {
          this.toast.showError('Session expirée. Reconnecte-toi.');
          this.router.navigateByUrl('/login');
        } else if (err && err.status === 403) {
          this.toast.showError('Accès refusé (ADMIN requis).');
          this.router.navigateByUrl('/commandes');
        } else if (err && err.status === 404) {
          this.toast.showError('Commande introuvable.');
          this.router.navigateByUrl('/commandes');
        } else {
          this.toast.showError('Erreur lors du chargement de la commande.');
        }

        return of(null);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((cmd: Commande | null) => {
      if (!cmd) return;

      // ✅ mapping propre
      this.description = (cmd as any).description || '';
      this.montant = (cmd as any).montant ?? null;

      const d = (cmd as any).dateCommande || '';
      this.dateCommande = d ? String(d).substring(0, 10) : '';

      const client = (cmd as any).client;
      if (client && client.id) {
        this.clientId = Number(client.id);
      } else if ((cmd as any).clientId) {
        this.clientId = Number((cmd as any).clientId);
      } else {
        this.clientId = null;
      }
    });
  }

  submit(form: any): void {
    if (form.invalid) {
      this.toast.showError('Veuillez corriger les champs du formulaire.');
      return;
    }

    if (this.montant === null || this.clientId === null) {
      this.toast.showError('Montant et client sont obligatoires.');
      return;
    }

    this.saving = true;

    this.commandeService.updateCommande(this.id, {
      description: this.description,
      montant: Number(this.montant),
      dateCommande: this.dateCommande,
      clientId: Number(this.clientId)
    }).pipe(
      catchError((err: any) => {
        console.error('updateCommande error:', err);

        if (err && err.status === 401) {
          this.toast.showError('Session expirée. Reconnecte-toi.');
          this.router.navigateByUrl('/login');
        } else if (err && err.status === 403) {
          this.toast.showError('Accès refusé (ADMIN requis).');
        } else {
          this.toast.showError('Erreur lors de la modification.');
        }

        return of(null);
      }),
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe((res: any) => {
      if (res === null) return;

      this.toast.showSuccess('Commande modifiée avec succès.');
      this.router.navigateByUrl('/commandes');
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/commandes');
  }
}
