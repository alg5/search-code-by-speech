import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ScaleService } from './services/scale.service';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { HighlightPipe } from './shared/pipes/highlight-pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    FormsModule,
    CommonModule,
    AutoCompleteModule,
    HighlightPipe
    
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('voice-code-search');
  private readonly http = inject(HttpClient);
  private readonly scaleService = inject(ScaleService);

  searchText: string = '';
  results: any[] = [];
  foods: IScaleItem[] = [];

  resultScaleCode: number | null = null;


  constructor(){
    this.loadFoods();
  }
  loadFoods() {
    this.http.get<any[]>('assets/data/scale-codes-data.json').subscribe(data => {
      console.log("data", data);
      this.foods = data;
          console.error("foods", this.foods);
    });
  }
  search() {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      this.results = [];
      return;
    }

    this.results = this.foods.filter(f =>
      f.product_name.toLowerCase().includes(term) ||
      f.key_ru.toLowerCase().includes(term) ||
      f.key_he.toLowerCase().includes(term)
    );
    console.error("this.results", this.results)
  }
  // Голосовой ввод
  startVoiceSearch() {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Ваш браузер не поддерживает голосовой ввод');
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = 'ru-RU'; // можно менять под нужный язык
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      this.searchText = event.results[0][0].transcript;
      this.search();
    };

    recognition.start();
  }
  selectCode(event: any) {
    // event — это выбранный объект из suggestions
    if (!event) return;

    // Сохраняем код выбранного продукта
    this.resultScaleCode = event.scale_code;

    // Можно сразу вызвать поиск или другую логику
    // Например, показать подробности продукта
    console.log('Выбран продукт:', event.product_name, 'код:', event.scale_code);
  }
  simulateVoice() {
    const text = prompt('Введите текст (имитация голоса):');
    if (text) {
      this.resultScaleCode = this.scaleService.findScaleCodeByText(text);
    }
  }
 
}
