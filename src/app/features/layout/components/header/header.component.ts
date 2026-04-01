import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { LangSwitchComponent } from '../../../../shared/components/lang-switch/lang-switch.component';

@Component({
  selector: 'spr-header',
  imports: [
    CommonModule,
    TranslatePipe,
    LangSwitchComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private readonly router = inject(Router);

  userName = 'header.guest';
  // greeting = 'Привет';
  visitTime!: Date;

  ngOnInit(): void {
    this.visitTime = new Date();
  }

  onSignIn() {
    this.router.navigate(['/auth']);
  }
}

