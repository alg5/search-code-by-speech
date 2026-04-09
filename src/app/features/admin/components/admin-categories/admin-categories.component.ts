import { Component, effect, inject, signal } from '@angular/core';
import { IProductCategory } from '../../../../shared/models/product.model';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GridColumType, IColumn, ICustomGridModel } from '../../../../shared/components/custom-components/custom-grid/custom-grid-models';
import { IToolbarModel } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar-models';
import { CustomGridComponent } from '../../../../shared/components/custom-components/custom-grid/custom-grid.component';
import { CustomToolbarService } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { CustomGridService } from '../../../../shared/components/custom-components/custom-grid/custom-grid.service';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';

@Component({
  selector: 'spr-admin-categories',
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
  providers: [ConfirmationService, TranslatePipe],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss',
})
export class AdminCategoriesComponent {
  
  private readonly supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toolbarService = inject(CustomToolbarService);
  private readonly customGridService = inject(CustomGridService);
  private readonly translate = inject(TranslatePipe);

// ===== state =====
  categories = signal<IProductCategory[]>([]);
  loading = signal(false);
  submited = signal(false);

 // inline edit
  editingId = signal<number | null>(null);
  editingRow = signal<IProductCategory | null>(null);

  // dialog (add)
  dialogVisible = signal(false);


  // form (add)
  fg = this.fb.group({
    code: ['', Validators.required],
    name_en: ['', Validators.required],
    name_ru: ['', Validators.required],
    name_he: ['', Validators.required],
    priority: [0]
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
      console.log('Delete signal received in AdminCategoriesComponent', event.row);
      this.confirmDelete(event.row);
    });
    effect(() => {
      const event = this.customGridService.saveEditedRowSignal();
      if (!event?.row) return;
      console.log('Save signal received in AdminCategoriesComponent', event.row);
      this.saveEdit(event.row);
    });    
    
  }

  ngOnInit(): void {
    this.fillColumns();
    this.fillToolbar();
    this.loadCategories();
  }

  async loadCategories() {
    try {
       const data = await this.supabaseService.getProductCategories();
      this.categories.set(data);
      console.log('Categories loaded', data, this.categories());
    } finally {
      this.loading.set(false);
      this.submited.set(false);
      this.fillCustomGridModel();
    }
  }


  // ===== ADD =====
  openAdd() {
    this.fg.reset({ priority: 0 });
    this.dialogVisible.set(true);
  }

  async saveNew() {
    this.submited.set(true);
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    await this.supabaseService.insertProductCategory(this.fg.value as IProductCategory);

    this.dialogVisible.set(false);
    this.loadCategories();
  }
// ===== EDIT INLINE =====
  // startEdit(row: IProductCategory) {
  //   this.editingId.set(row.id!);
  //   this.editingRow.set({ ...row }); // копия
  // }

  // updateField(field: string, value: any) {
  //   const row = this.editingRow();
  //   if (!row) return;

  //   row[field] = field === 'priority' ? Number(value) : value;
  //   this.editingRow.set({ ...row });
  // }

  async saveEdit(row: IProductCategory) {
    await this.supabaseService.updateProductCategory(row);
    this.loadCategories();
  }

  // cancelEdit() {
  //   this.editingId.set(null);
  //   this.editingRow.set(null);
  // }


  // ===== DELETE =====
confirmDelete(row) {
  this.confirmationService.confirm({
    message: `${this.translate.transform('admin.categories.confirmDelete')} ${row.code}?`,
    acceptLabel: this.translate.transform('message.yes'),
    rejectLabel: this.translate.transform('message.no'),
    acceptButtonStyleClass: 'p-button-danger',
    accept: async () => {
      await this.supabaseService.deleteProductCategory(row.id);
      this.loadCategories();
    }
  });
}

  //#region custom-grid actions
  fillColumns() {
    this.columns = [
      { 
        headerText: 'ID'
        , dataField: 'id'
        , dataType: GridColumType.numeric
      },
      { headerText: this.translate.transform('column.code')
        , dataField: 'code'
        , dataType: GridColumType.textEditable
        , required: true
       },
      { headerText: this.translate.transform('column.nameEn'), dataField: 'name_en', dataType: GridColumType.textEditable, required: true },
      { headerText: this.translate.transform('column.nameRu'), dataField: 'name_ru', dataType: GridColumType.textEditable },
      { headerText: this.translate.transform('column.nameHe'), dataField: 'name_he', dataType: GridColumType.textEditable },
      { headerText: this.translate.transform('column.priority'), dataField: 'priority', dataType: GridColumType.numericEditable },
      { headerText: '', dataField: '', dataType: GridColumType.deleteButton},
      { headerText: '', dataField: '', dataType: GridColumType.editButton},

    ];
  }
  fillToolbar() {
    this.customToolbar = {
      showNumResults: true,
      numResultsTextBase: `${this.translate.transform('admin.categories.total')}: #`,
      showNewButton: true,
      showNewButtonText: this.translate.transform('admin.categories.add'),
    }
  }
  fillCustomGridModel() {
    this.customGridModel = {
      dataSource: this.categories(),
      columns: this.columns,
      toolbarModel: this.customToolbar,
      idField: 'id',
      key: 'categories'
    }
  }

  //#endregion custom-grid actions

}
