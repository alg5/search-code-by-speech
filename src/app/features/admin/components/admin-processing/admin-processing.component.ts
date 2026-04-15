import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CustomGridComponent } from '../../../../shared/components/custom-components/custom-grid/custom-grid.component';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { ConfirmationService } from 'primeng/api';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { CustomToolbarService } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar.service';
import { CustomGridService } from '../../../../shared/components/custom-components/custom-grid/custom-grid.service';
import { IProductProcessing } from '../../../../shared/models/product.model';
import { GridColumType, IColumn, ICustomGridModel } from '../../../../shared/components/custom-components/custom-grid/custom-grid-models';
import { IToolbarModel } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar-models';

@Component({
  selector: 'spr-admin-processing',
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    FloatLabelModule,
    MessageModule,
    CustomGridComponent,
    TranslatePipe
  ],
  providers: [ConfirmationService, TranslatePipe],  templateUrl: './admin-processing.component.html',
  styleUrl: './admin-processing.component.scss',
})
export class AdminProcessingComponent {
  private readonly supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toolbarService = inject(CustomToolbarService);
  private readonly customGridService = inject(CustomGridService);
  private readonly translate = inject(TranslatePipe);

// ===== state =====
  processingTypes = signal<IProductProcessing[]>([]);
  loading = signal(false);
  submited = signal(false);

 // inline edit
  editingId = signal<number | null>(null);
  editingRow = signal<IProductProcessing | null>(null);

  // dialog (add)
  dialogVisible = signal(false);


  // form (add)
  fg = this.fb.group({
    code: ['', Validators.required],
    name_en: ['', Validators.required],
    name_ru: ['', Validators.required],
    name_he: ['', Validators.required],
  });

  //#region custom-grid definition
    customGridModel:ICustomGridModel;
    customToolbar:IToolbarModel
    columns: IColumn[] ;

  //#endregion custom-grid definition


  constructor() {
    effect(() => {
      const event = this.toolbarService.newButtonClickedSignal();
      if (!event?.value) return;
      this.openAdd();
    });
    effect(() => {
      const event = this.customGridService.rowDeleteSignal();
      if (!event?.row) return;
      console.log('Delete signal received in AdminProcessingComponent', event.row);
      this.confirmDelete(event.row);
    });
    effect(() => {
      const event = this.customGridService.saveEditedRowSignal();
      if (!event?.row) return;
      console.log('Save signal received in AdminProcessingComponent', event.row);
      this.saveEdit(event.row);
    });    
    
  }

  ngOnInit(): void {
    this.fillColumns();
    this.fillToolbar();
    this.loadProcessing();
  }

  async loadProcessing() {
    try {
       const data = await this.supabaseService.getProductProcessing();
      this.processingTypes.set(data);
      console.log('Processing loaded', data, this.processingTypes());
    } finally {
      this.loading.set(false);
      this.submited.set(false);
      this.fillCustomGridModel();
    }
  }


  // ===== ADD =====
  openAdd() {
    this.fg.reset();
    this.dialogVisible.set(true);
  }

  async saveNew() {
    this.submited.set(true);
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    await this.supabaseService.insertProductProcessing(this.fg.value as IProductProcessing);

    this.dialogVisible.set(false);
    this.loadProcessing();
  }
// ===== EDIT INLINE =====
 
  async saveEdit(row: IProductProcessing) {
    await this.supabaseService.updateProductProcessing(row);
    this.loadProcessing();
  }

  // ===== DELETE =====
confirmDelete(row) {
  this.confirmationService.confirm({
    message: `${this.translate.transform('admin.processing.confirmDelete')} ${row.code}?`,
    acceptLabel: this.translate.transform('message.yes'),
    rejectLabel: this.translate.transform('message.no'),
    acceptButtonStyleClass: 'p-button-danger',
    accept: async () => {
      await this.supabaseService.deleteProductProcessing(row.id);
      this.loadProcessing();
    }
  });
}

  //#region custom-grid actions
  fillColumns() {
    this.columns = [
      // { 
      //   headerText: 'ID'
      //   , dataField: 'id'
      //   , dataType: GridColumType.numeric
      // },
      { headerText: this.translate.transform('column.code')
        , dataField: 'code'
        , dataType: GridColumType.textEditable
        , required: true
       },
      { headerText: this.translate.transform('column.nameEn'), dataField: 'name_en', dataType: GridColumType.textEditable, required: true },
      { headerText: this.translate.transform('column.nameRu'), dataField: 'name_ru', dataType: GridColumType.textEditable },
      { headerText: this.translate.transform('column.nameHe'), dataField: 'name_he', dataType: GridColumType.textEditable },
      { headerText: '', dataField: '', dataType: GridColumType.deleteButton},
      { headerText: '', dataField: '', dataType: GridColumType.editButton},

    ];
  }
  fillToolbar() {
    this.customToolbar = {
      showNumResults: true,
      numResultsTextBase: `${this.translate.transform('admin.processing.total')}: #`,
      showNewButton: true,
      showNewButtonText: this.translate.transform('admin.processing.add'),
    }
  }
  fillCustomGridModel() {
    this.customGridModel = {
      dataSource: this.processingTypes(),
      columns: this.columns,
      toolbarModel: this.customToolbar,
      idField: 'id',
      key: 'processing'
    }
  }

  //#endregion custom-grid actions


}
