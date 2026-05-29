// src/app/main-layout/main-layout.component.ts
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SearchLayoutComponent } from '../../../search/components/search-layout/search-layout.component';
import { LangSwitchComponent } from '../../../../shared/components/lang-switch/lang-switch.component';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { LanguageService } from '../../../../core/services/language.service';

import { Subscription } from 'rxjs'; // <--- Импорт RxJS Subscription
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'spr-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonModule, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly supabase = inject(SupabaseService);
  public readonly languageService = inject(LanguageService);

  isLoggedIn: boolean = false;
  isAdmin: boolean = false; // Будет определяться из профиля
  private _authSubscription: Subscription | undefined;

  async ngOnInit() {
    // <--- ИСПРАВЛЕНО: Подписываемся на Observable `authStateChanges$`
    this._authSubscription = this.supabase.authStateChanges$.subscribe(async (state) => {
      // state будет { event, session } или null
      if (state) {
        await this.checkAuthStatus();
      } else {
        // Initial state or Null if user is not logged in
        this.isLoggedIn = false;
        this.isAdmin = false;
      }
    });
    await this.checkAuthStatus();
  }

  ngOnDestroy(): void {
    if (this._authSubscription) {
      this._authSubscription.unsubscribe();
    }
  }

  async checkAuthStatus() {
    const user = await this.supabase.getCurrentUser();
    this.isLoggedIn = !!user;
    if (user) {
      const profile = await this.supabase.getProfile();
      this.isAdmin = profile?.role === 'admin';
    } else {
      this.isAdmin = false;
    }
  }

  goToAuth() {
    this.router.navigate(['/auth']);
  }

  goToAdmin() {
    this.router.navigate(['/admin/dashboard']);
  }

  async signOut() {
    await this.supabase.signOut();
    this.router.navigate(['/auth']);
  }
}
