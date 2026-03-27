import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/components/auth/auth.component';
import { MainLayoutComponent } from './features/layout/components/main-layout/main-layout.component';
import { SearchLayoutComponent } from './features/search/components/search-layout/search-layout.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent }, // Страница входа/регистрации
//   {
//     path: 'admin',
//     component: LayoutComponent, // Макет для админ-панели (со своим сайдбаром и хедером)
//     children: [
//       { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) }, // Предполагаем DashboardComponent
//       { path: 'products', component: ProductsComponent }, // Пример использования ProductsComponent
//       // Добавьте остальные маршруты админки здесь (users, categories, processing)
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
//     ],
//     // canActivate: [AuthGuard] // Защита админки. Реализуем позже.
//   },
  {
    path: '', // Главный маршрут
    component: MainLayoutComponent, // Используем новый MainLayoutComponent
    children: [
      { path: '', component: SearchLayoutComponent, pathMatch: 'full' }, // Ваш основной поиск будет на главной
      // Здесь могут быть другие публичные страницы (например, /about, /contact)
    ]
  },
  { path: '**', redirectTo: '' } // Любой другой путь ведет на главную
];



