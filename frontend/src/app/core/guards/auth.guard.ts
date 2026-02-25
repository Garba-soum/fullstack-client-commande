import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getAccessToken();

  // ❌ Pas de token → pas connecté
  if (!token) {
    return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
    });
  }

  // ❌ Token expiré → déconnexion propre
  if (auth.isTokenExpired()) {
    auth.logout();
    return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
    });
  }

  // ✅ Token valide → accès autorisé
  return true;
};
