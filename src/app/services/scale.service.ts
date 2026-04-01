import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import data from '../../assets/data/scale-codes-data.json';

@Injectable({
  providedIn: 'root',
})
export class ScaleService {
  private readonly http = inject(HttpClient);
  private dataUrl = 'assets/data/scale-codes-data.json';
  private items: IScaleItem[] = [];
   private scaleData = data;

  constructor() {
    this.http.get<IScaleItem[]>(this.dataUrl).subscribe(d => this.items = d);
  }

  getScaleCodeByText(text: string): number | null {
    const lower = text.toLowerCase();
    const found = this.items.find(item =>
      item.product_name.toLowerCase() === lower ||
      item.key_ru.toLowerCase() === lower ||
      item.key_he.toLowerCase() === lower
    );
    return found ? found.scale_code : null;
  }

    findScaleCodeByText(text: string): number | null {
    const lowerText = text.toLowerCase();
    const item = this.scaleData.find(
      (d: any) =>
        d.product_name.toLowerCase().includes(lowerText) ||
        d.key_ru.toLowerCase().includes(lowerText) ||
        d.key_he.toLowerCase().includes(lowerText)
    );
    return item ? item.scale_code : null;
  }
  
}
