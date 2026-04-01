import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomToolbarService {

  constructor() { }
  newButtonClickedSignal = signal<{ value: boolean; timestamp: number }>({ value: false, timestamp: Date.now() });
  calculatorIconClickedSignal = signal<{ value: boolean; timestamp: number }>({ value: false, timestamp: Date.now() });
}
