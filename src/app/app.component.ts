import { Component, inject, Renderer2, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'spr-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private readonly renderer = inject(Renderer2);

  async ngOnInit() {
    // forcing light mode to avoid dark mode issues in some components (like PrimeNG DataTable)
    this.renderer.setStyle(document.body, 'background-color', '#ffffff');
    this.renderer.setStyle(document.body, 'color', '#16254f');
  }
}
