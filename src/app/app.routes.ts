import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/components/auth/auth.component';
import { MainLayoutComponent } from './features/layout/components/main-layout/main-layout.component';
import { SearchLayoutComponent } from './features/search/components/search-layout/search-layout.component';

export const routes: Routes = [
  {
    path: '', // Главный маршрут для всего приложения
    component: MainLayoutComponent,
    children: [
      { path: '', component: SearchLayoutComponent, pathMatch: 'full' }, // Поиск на главной
      { path: 'auth', component: AuthComponent }, // Страница входа/регистрации
      // Другие маршруты, работающие внутри MainLayout
      // { path: 'about', component: AboutComponent },
      // { path: 'contact', component: ContactComponent },
    ]
  },
  { path: '**', redirectTo: '' } // Любой другой путь ведет на главную
];



