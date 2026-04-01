// src/app/main-layout/main-layout.component.ts
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SearchLayoutComponent } from '../../../search/components/search-layout/search-layout.component';
import { LangSwitchComponent } from '../../../../shared/components/lang-switch/lang-switch.component';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { LanguageService } from '../../../../core/services/language.service';

// Ваши компоненты
// import { SprLangSwitchComponent } from '../spr-lang-switch/spr-lang-switch.component'; // Убедитесь в пути
// import { SprSearchLayoutComponent } from '../spr-search-layout/spr-search-layout.component'; // Убедитесь в пути

// Сервисы
// import { SupabaseService } from '../services/supabase.service';
// import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs'; // <--- Импорт RxJS Subscription
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'spr-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ButtonModule,
    // LangSwitchComponent,
    HeaderComponent
    // SearchLayoutComponent // Ваш компонент поиска
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly supabase = inject(SupabaseService);
  public readonly languageService = inject(LanguageService);

  isLoggedIn: boolean = false;
  isAdmin: boolean = false; // Будет определяться из профиля
 private _authSubscription: Subscription | undefined; // <--- Сохраняем RxJS подписку

async ngOnInit() {
    // <--- ИСПРАВЛЕНО: Подписываемся на Observable `authStateChanges$`
    this._authSubscription = this.supabase.authStateChanges$.subscribe(async (state) => {
      // state будет { event, session } или null
      if (state) {
        await this.checkAuthStatus();
      } else {
        // Начальное состояние или null после SignOut
        this.isLoggedIn = false;
        this.isAdmin = false;
      }
    });
    // Также проверяем статус при первом запуске
    await this.checkAuthStatus();
  }

  ngOnDestroy(): void {
    // <--- Отписываемся от RxJS Observable при уничтожении компонента
    if (this._authSubscription) {
      this._authSubscription.unsubscribe();
    }
  }

  async checkAuthStatus() {
    const user = await this.supabase.getCurrentUser();
    this.isLoggedIn = !!user;
    if (user) {
      const profile = await this.supabase.getProfile(); // Метод для получения профиля
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
    this.router.navigate(['/auth']); // После выхода на страницу входа
  }
}
