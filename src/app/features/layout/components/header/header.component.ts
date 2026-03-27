import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  userName = 'header.guest';
  // greeting = 'Привет';
  visitTime!: Date;

  ngOnInit(): void {
    this.visitTime = new Date();
  }
  onSignIn(){}
}


