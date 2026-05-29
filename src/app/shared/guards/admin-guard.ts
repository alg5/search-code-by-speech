import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  canActivate(): boolean {
    // проверяем сигнал
    if (this.supabaseService.isAdmin()) {
      return true; // only admin or superadmin allowed
    }

    // otherwise, redirect to home
    this.router.navigate(['/']);
    return false;
  }
}
