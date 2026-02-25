import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { inject } from "@angular/core";

export const guestGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const token = auth.getAccessToken();

    // ❌ Token présent → déjà connecté
    if(token && !auth.isTokenExpired()) {
        const returnUrl = route.queryParamMap.get('returnUrl') || '/clients';
        return router.parseUrl(returnUrl);
    }

    // ✅ Pas de token → accès autorisé
    return true;
}; 