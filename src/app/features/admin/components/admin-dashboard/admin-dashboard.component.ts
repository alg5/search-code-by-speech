import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';

interface DashboardCard {
  label: string;
  count: number;
  route: string;
  color: string;
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

  cards = signal([
    { key: 'products', label: 'admin.products', count: null, route: '/admin/products', color: '#42A5F5' },
    { key: 'categories', label: 'admin.categories', count: null, route: '/admin/categories', color: '#66BB6A' },
    { key: 'processing', label: 'admin.processing', count: null, route: '/admin/processing', color: '#FFA726' },
    { key: 'users', label: 'admin.users', count: null, route: '/admin/users', color: '#AB47BC' },
  ]);
  
  constructor( ) {
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
    // route точно полный, с ведущим '/'
    this.router.navigateByUrl(route);
  }
}