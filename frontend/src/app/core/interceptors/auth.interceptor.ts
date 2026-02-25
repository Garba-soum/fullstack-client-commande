import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // ⚠️ SSR safety : localStorage n'existe pas côté serveur
  if (typeof window === 'undefined') {
    return next(req);
  }

  // Ne pas intercepter le login
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const token = authService.getAccessToken();

  // ✅ Si token présent → on ajoute le header Authorization
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // ❌ Pas de token → requête inchangée
  return next(req);
};
