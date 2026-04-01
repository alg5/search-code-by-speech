import { Component, effect, inject, Input } from '@angular/core';
import { IToolbarModel } from './custom-toolbar-models';
import { CustomToolbarService } from './custom-toolbar.service';
import { CustomGridService } from '../custom-grid/custom-grid.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'sap-custom-toolbar',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './custom-toolbar.component.html',
  styleUrl: './custom-toolbar.component.scss'
})
export class CustomToolbarComponent {
  private customToolbarService = inject(CustomToolbarService);
  private customGridService = inject(CustomGridService);
  @Input() 
  set toolbarModel(value:IToolbarModel){
    this._toolbarModel = value;
    if (value){
      this.init();
    }
  }
  get toolbarModel(){
    return this._toolbarModel;
  }
  private _toolbarModel:IToolbarModel;

  isMobile = false;
  gridKey = ""
  showNumResults = false;
  numResultsText = "";
  numResultsTextBase = "";
  numResultsTextBaseDefault =  `מוצגות # רשומות`;
  showNewButton = false;
  showNewButtonText = "חדש";
  newButtonDisabled = false;
  showHandlingRequestsButton = false;
  showCalculatorIcon = false;
  showHandlingRequestsButtonText = "טיפול בבקשות"
  requestsCount = 0;
  itemSelected: any;

  constructor() {
    effect(() => {
        const ev = this.customGridService.numResultsTextSignal();
        if (!ev) return;
        
        this.numResultsText = ev.value;
    });
    // effect(() => {
    //   const ev = this.customGridService.itemSelectedSignal();
    //   if (!ev) return;
    //     const statusButtonDisabled = ev.value;
    //     this.newButtonDisabled = statusButtonDisabled;
    //     if(!statusButtonDisabled){
    //       this.itemSelected = ev.row;
    //     } else {
    //       this.itemSelected = null;
    //     }
    // });
  }
  init(){
    this.showNumResults = this.toolbarModel.showNumResults;
    this.numResultsText = this.toolbarModel.numResultsText;
    this.numResultsTextBase = this.toolbarModel.numResultsTextBase ? this.toolbarModel.numResultsTextBase : this.numResultsTextBaseDefault;
    this.gridKey = this.toolbarModel.key;
    this.numResultsText = this.toolbarModel.numResultsText;
    this.numResultsTextBase = this.toolbarModel.numResultsTextBase ? this.toolbarModel.numResultsTextBase : this.numResultsTextBaseDefault;
    this.showNewButton = this.toolbarModel.showNewButton;
    this.showNewButtonText = this.toolbarModel.showNewButtonText;
    this.newButtonDisabled = this.toolbarModel.newButtonDisabled ? this.toolbarModel.newButtonDisabled : false;
    this.showHandlingRequestsButton = this.toolbarModel.showHandlingRequestsButton;
    this.showHandlingRequestsButtonText = this.toolbarModel.showHandlingRequestsButtonText;
    this.showCalculatorIcon = this.toolbarModel.showCalculatorIcon ? this.toolbarModel.showCalculatorIcon : false;
    this.requestsCount = this.toolbarModel.requestsCount ? this.toolbarModel.requestsCount : 0; 
  }
  onClicknewButton(){
    console.log('new button clicked');
      this.customToolbarService.newButtonClickedSignal.set({ value: true, timestamp: Date.now() });
  }
  // onClickHandlingRequestsButton(){
  //     this.customToolbarService.handlingRequestsButtonClickedSignal.set(true);
  // }
  onClickCalculatorIcon(){
    console.log('calculator icon clicked');
      this.customToolbarService.calculatorIconClickedSignal.set({ value: true, timestamp: Date.now() });
  }

}
