import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';

interface DashboardCard {
  key: string; // for mapping with server data
  label: string;
  count: number;
  route: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'spr-admin-dashboard',
  imports: [
    CommonModule,
    RouterOutlet,
    TranslatePipe
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);

  cards = signal<DashboardCard[]>([
    { key: 'products', label: 'admin.products', count: null, route: '/admin/products', color: '#8ec98e', icon: 'products' },
    { key: 'categories', label: 'admin.categories', count: null, route: '/admin/categories', color: '#7cb87c', icon: 'categories' },
    { key: 'processing', label: 'admin.processing', count: null, route: '/admin/processing', color: '#6aa96a', icon: 'processing' },
    { key: 'users', label: 'admin.users', count: null, route: '/admin/users', color: '#5a9a5a', icon: 'users' },
  ]);

  constructor() {
    this.loadCounts();
  }

  async loadCounts() {
    try {
      const counts = await this.supabaseService.getDashboardCounts();

      this.cards.update(cards =>
        cards.map(c => ({
          ...c,
          count: counts[c.key as keyof typeof counts]
        }))
      );
    } catch (e) {
      console.error('Dashboard counts error', e);
    }
  }

  goTo(route: string) {
    // route is guaranteed to be full, with leading '/'
    this.router.navigateByUrl(route);
  }
}