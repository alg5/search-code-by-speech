import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomToolbarService {

  constructor() { }
  calculatorIconClickedSignal = signal<{ value: boolean; timestamp: number }>({ value: false, timestamp: Date.now() });
  newButtonClickedSignal = signal<{ value: boolean; timestamp: number; key?: string }>({ 
    value: false, 
    timestamp: Date.now() 
  });
}

