import { Component, inject, Renderer2, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private readonly renderer = inject(Renderer2) ;

  async ngOnInit() {
    // Принудительно светлая тема
    this.renderer.setStyle(document.body, 'background-color', '#ffffff');
    this.renderer.setStyle(document.body, 'color', '#16254f');
  }
}
