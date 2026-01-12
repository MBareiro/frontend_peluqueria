import { inject } from "@angular/core"
import { Router } from "@angular/router"
import { AuthService } from '../services/auth.service';

export const loginGuard = () => {
    const router = inject(Router);
    const auth = inject(AuthService);

    const user = auth.currentUserValue;
    if (user && user.id) {
        return true;
    } else {
        router.navigate(['/']);
        return false;
    }
}