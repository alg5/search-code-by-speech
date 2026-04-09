import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { LangSwitchComponent } from '../../../../shared/components/lang-switch/lang-switch.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { environment } from '../../../../../environments/environment';
import { SupabaseService } from '../../../../core/services/supabase.service';

@Component({
  selector: 'spr-header',
  imports: [
    CommonModule,
    TranslatePipe,
    LangSwitchComponent,
    BreadcrumbComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly supabaseService = inject(SupabaseService);

  userName = 'header.guest';
  visitTime!: Date;
  isUserLoggedIn = false;
  isUserMenuOpen = false;
  isAdmin = this.supabaseService.isAdmin; // Сигнал для определения роли пользователя
  // isAdmin = this.supabaseService.hasRole(['admin', 'superadmin']);
  // isSuperAdmin = this.supabaseService.hasRole(['superadmin']);

  ngOnInit(): void {
    this.visitTime = new Date();
    const userToken = localStorage.getItem(environment.supabaseTokenName);
    if (userToken) {
      const parsedToken = JSON.parse(userToken);
      console.log('User token found in localStorage:', parsedToken.user.user_metadata.full_name);
      this.userName = parsedToken.user.user_metadata.full_name || 'header.user';
      // const profile = this.supabaseService.profile;
      // this.isAdmin = parsedToken.user.user_metadata.is_admin || false; 
      this.isUserLoggedIn = true;
    }
  }

  onSignIn() {
    this.router.navigate(['/auth']);
  }

  onSignOut() {
    localStorage.removeItem(environment.supabaseTokenName);
    this.isUserLoggedIn = false;
    this.userName = 'header.guest';
    this.isUserMenuOpen = false;
    this.router.navigate(['/']);
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  goToDashboard() {
    this.isUserMenuOpen = false;
    this.router.navigate(['/user/dashboard']);
  }

  goToProfile() {
    this.isUserMenuOpen = false;
    this.router.navigate(['/user/profile']);
  }
  goToAdminDashboard(){
    this.router.navigate(['/admin']);
  }
}

