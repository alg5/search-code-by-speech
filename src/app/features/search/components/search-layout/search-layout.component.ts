import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SearchInputComponent } from '../search-input/search-input.component';
import { SearchResultsComponent } from '../search-results/search-results.component';

@Component({
  selector: 'spr-search-layout',
  imports: [
    CommonModule, 
    SearchInputComponent, 
   ],
  templateUrl: './search-layout.component.html',
  styleUrl: './search-layout.component.scss',
})
export class SearchLayoutComponent {
  searchTerm = '';
  
  // сюда можно добавить фильтры
  filters = {};

  // событие от input
  onSearch(term: string) {
    this.searchTerm = term;
  }
}
