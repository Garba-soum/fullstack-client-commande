import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  // ✅ RouterModule = routerLink, routerLinkActive, routerLinkActiveOptions, router-outlet
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] // ✅ styleUrls (pas styleUrl)
})
export class App implements OnInit {

  isAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public toast: ToastService
  ) {}

  ngOnInit(): void {
    this.refreshRole();
  }

  // ✅ connecté ?
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // ✅ admin ?
  refreshRole(): void {
    this.isAdmin = this.authService.isAdmin();
  }

  // 🔓 Déconnexion
  logout(): void {
    this.authService.logout();
    this.isAdmin = false;
    this.router.navigateByUrl('/login');
  }
}
