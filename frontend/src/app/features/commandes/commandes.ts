import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';

import { CommandeService } from '../../services/commandes.service';
import { Commande } from '../../models/commande.model';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './commandes.html',
  styleUrls: ['./commandes.css']
})
export class Commandes implements OnInit {
   
  //liste des commandes
  commandes: Commande[] = [];

  //Liste complète
  allCommandes: Commande[] = [];

  // clientId courant (vient de l'URL)
  selectedClientId: number | null = null;
  
  loading: boolean = false;
  errorMessage: string = '';

  isAdmin: boolean = false;

  constructor(
    private commandeService: CommandeService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    // Ecoute les changements d'URL (Si cliques "voir" sur un autre client)
    this.route.queryParams.subscribe((params: any) => {
      const raw = params['clientId'];

      //convertir en nombre si présent, sinon null
      this.selectedClientId = raw ? Number(raw) : null;

      // recharger la liste
      this.loadCommandes();
  });
  }

  loadCommandes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.commandeService.getCommandes()
      .pipe(
        timeout(5000),

        // En cas d'erreur HTTP on affiche un message + on évite de casser l'app
        catchError((err: any) => {
          console.error('getCommandes error:', err);

          if (err && err.status === 401) {
            this.toast.showError('Session expirée. Reconnecte-toi.');
            this.router.navigateByUrl('/login');
          } else if (err && err.status === 403) {
            this.errorMessage = "Accès refusé.";
            this.toast.showError("Accès refusé.");
          } else {
            this.errorMessage = 'Erreur lors du chargement des commandes.';
            this.toast.showError(this.errorMessage);
          }

          return of([] as Commande[]);
        }),

        // finalize garantit que loading repasse à false (succès ou erreur)
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data: Commande[]) => {
        //stocke la liste complète
        this.allCommandes = data || [];
        this.applyFilter(); // applique le filtre éventuel
      });
  }

  // Filtre local (sans refaire un appel HTTP)
  applyFilter(): void {
    if (this.selectedClientId == null) {
      this.commandes =this.allCommandes; 
      return;
    }

    const id = Number(this.selectedClientId);

    //garde seulement les commandes dont le clientId correspond
    this.commandes = this.allCommandes.filter((c: Commande) => {
      return !!c.client && Number(c.client.id) === id;
    });
  }

  deleteCommande(id: number): void {
    if (!confirm('Supprimer cette commande ?')) return;

    this.commandeService.deleteCommande(id).subscribe({
      next: () => {
        //  retirer localement (pas de reload)
        const idNum = Number(id);

        // retire la liste complète 
        this.allCommandes = this.allCommandes.filter((c: Commande) => Number(c.id) !== idNum);

        // puis ré-applique le filtre pour mettre à jour l'affichage
        this.applyFilter();

        this.toast.showSuccess('Commande supprimée.');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('deleteCommande error:', err);

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

  // Permet de revenir à toute les commandes
  clearClientFilter(): void {
    this.router.navigate(['/commandes']); // enlève ?clientId de l'URL
  }
}
