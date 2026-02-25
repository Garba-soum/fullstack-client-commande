import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'] // ✅ important
})
export class Login {

  username: string = '';
  password: string = '';
  

  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    if(this.loading) return; // Prévenir les doubles soumissions
    this.errorMessage = '';
    this.loading = true;

  this.authService.login(this.username, this.password)
  .pipe(finalize(() => (this.loading = false)))
  .subscribe({

        next: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/clients';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.loading = false; // immédiat 
          this.errorMessage = 
            (err.status === 401 || err.status === 403) ?
            'Nom d’utilisateur ou mot de passe incorrect' :
            'Erreur serveur. Réessaie plus tard.';

            this.cdr.detectChanges(); // forcer la détection de changement
        }
  });
  }
}
