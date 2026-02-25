import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // pas connecté -> login + retour url
  if (!auth.getAccessToken()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // connecté mais pas admin -> clients
  if (!auth.isAdmin()) {
    router.navigateByUrl('/clients');
    return false;
  }

  return true;
};
