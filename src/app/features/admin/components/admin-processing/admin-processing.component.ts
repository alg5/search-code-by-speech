import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CustomGridComponent } from '../../../../shared/components/custom-components/custom-grid/custom-grid.component';
import { CustomGridService } from '../../../../shared/components/custom-components/custom-grid/custom-grid.service';
import {
  GridColumType,
  IColumn,
  ICustomGridModel,
} from '../../../../shared/components/custom-components/custom-grid/custom-grid-models';
import { CustomToolbarService } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar.service';
import { IToolbarModel } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar-models';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { IProductProcessing } from '../../../../shared/models/product.model';

@Component({
  selector: 'spr-admin-processing',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    FloatLabelModule,
    MessageModule,
    CustomGridComponent,
    TranslatePipe,
    ToastModule,
  ],
  providers: [ConfirmationService, TranslatePipe],
  templateUrl: './admin-processing.component.html',
  styleUrl: './admin-processing.component.scss',
})
export class AdminProcessingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supabaseService = inject(SupabaseService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toolbarService = inject(CustomToolbarService);
  private readonly customGridService = inject(CustomGridService);
  private readonly messageService = inject(MessageService);
  private readonly languageService = inject(LanguageService);
  private readonly translate = inject(TranslatePipe);

  // ===== state =====
  processingTypes = signal<IProductProcessing[]>([]);
  filteredProcessingTypes = signal<IProductProcessing[]>([]);

  loading = signal(false);
  submited = signal(false);
  searchText = signal('');

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
    name_he: [''],
    name_fr: [''],
    priority: [null],
  });

  //#region custom-grid definition
  customGridModel: ICustomGridModel;
  customToolbar: IToolbarModel;
  columns: IColumn[];
  //#endregion custom-grid definition

  constructor() {
    effect(() => {
      const event = this.toolbarService.newButtonClickedSignal();
      if (!event?.value) return;
      if (event.key !== 'processing') return; // filter by component key

      // Reset signal to prevent re-triggering on navigation
      untracked(() => {
        this.toolbarService.newButtonClickedSignal.set({ value: false, timestamp: Date.now() });
      });

      this.openAdd();
    });

    effect(() => {
      const event = this.customGridService.rowDeleteSignal();
      if (!event?.row) return;
      if (event.key !== 'processing') return; // filter by component key
      this.confirmDelete(event.row);
    });

    effect(() => {
      const event = this.customGridService.saveEditedRowSignal();
      if (!event?.row) return;
      if (event.key !== 'processing') return; // filter by component key
      console.log('Save signal received in AdminProcessingComponent', event.row);
      this.saveEdit(event.row);
    });

    effect(() => {
      const text = this.searchText()?.toLowerCase() || '';
      if (!this.customGridModel) return;

      const filtered = this.processingTypes().filter(
        (p) =>
          !text ||
          p.code?.toLowerCase().includes(text) ||
          p.name_en?.toLowerCase().includes(text) ||
          p.name_ru?.toLowerCase().includes(text) ||
          p.name_he?.toLowerCase().includes(text) ||
          p.name_fr?.toLowerCase().includes(text),
      );

      this.filteredProcessingTypes.set(filtered);

      // immutable update: create a new gridModel so the child component detects the change
      this.customGridModel = {
        ...this.customGridModel,
        toolbarModel: {
          ...this.customGridModel.toolbarModel,
        },
        dataSource: filtered,
        filterStringInitial: text,
      };
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
      this.filteredProcessingTypes.set(data);
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

    try {
      await this.supabaseService.insertProductProcessing(this.fg.value as IProductProcessing);

      this.dialogVisible.set(false);
      this.loadProcessing();

      this.messageService.add({
        severity: 'success',
        summary: this.translate.transform('message.success.processing.created'),
      });
    } catch (error: any) {
      console.error(error);

      if (error?.code === '23505') {
        // duplicate code
        this.messageService.add({
          severity: 'error',
          summary: this.translate.transform('message.error'),
          detail: this.languageService.translate('message.error.processing.duplicateCode', '', {
            code: this.fg.get('code')?.value,
          }),
          sticky: true,
        });
      } else {
        // any other error
        this.messageService.add({
          severity: 'error',
          summary: this.translate.transform('message.error'),
          detail: this.translate.transform('message.unexpectedError'),
          sticky: true,
        });
      }
    }
  }

  // ===== EDIT INLINE =====
  async saveEdit(row: IProductProcessing) {
    try {
      await this.supabaseService.updateProductProcessing(row);
      this.loadProcessing();

      this.messageService.add({
        severity: 'success',
        summary: this.translate.transform('message.success.processing.updated'),
      });
    } catch (error: any) {
      console.error(error);

      if (error?.code === '23505') {
        // duplicate code
        this.messageService.add({
          severity: 'error',
          summary: this.translate.transform('message.error'),
          detail: this.languageService.translate('message.error.processing.duplicateCode', '', {
            code: row.code,
          }),
          sticky: true,
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.transform('message.error'),
          detail: this.translate.transform('message.unexpectedError'),
          sticky: true,
        });
      }
    }
  }

  // ===== DELETE =====
  confirmDelete(row: IProductProcessing) {
    this.confirmationService.confirm({
      message: `${this.translate.transform('admin.processing.confirmDelete')} ${row.code}?`,
      acceptLabel: this.translate.transform('message.yes'),
      rejectLabel: this.translate.transform('message.no'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await this.supabaseService.deleteProductProcessing(row.id);
          this.loadProcessing();
          this.messageService.add({
            severity: 'success',
            detail: this.translate.transform('message.success.processing.deleted'),
          });
        } catch (error: any) {
          console.error(error);

          if (error?.code === '23503') {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.transform('message.error'),
              detail: this.translate.transform('message.error.processing.deleteHasProducts'),
              sticky: true,
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.transform('message.error'),
              detail: this.translate.transform('message.unexpectedError'),
              sticky: true,
            });
          }
        }
      },
    });
  }

  //#region custom-grid actions
  fillColumns() {
    this.columns = [
      {
        headerText: this.translate.transform('column.code'),
        dataField: 'code',
        dataType: GridColumType.textEditable,
        required: true,
      },
      {
        headerText: this.translate.transform('column.nameEn'),
        dataField: 'name_en',
        dataType: GridColumType.textEditable,
        required: true,
      },
      {
        headerText: this.translate.transform('column.nameRu'),
        dataField: 'name_ru',
        dataType: GridColumType.textEditable,
      },
      {
        headerText: this.translate.transform('column.nameHe'),
        dataField: 'name_he',
        dataType: GridColumType.textEditable,
      },
      {
        headerText: this.translate.transform('column.nameFr'),
        dataField: 'name_fr',
        dataType: GridColumType.textEditable,
      },
      {
        headerText: this.translate.transform('column.priority'),
        dataField: 'priority',
        dataType: GridColumType.numericEditable,
      },
      {
        headerText: '',
        dataField: '',
        dataType: GridColumType.deleteButton,
      },
      {
        headerText: '',
        dataField: '',
        dataType: GridColumType.editButton,
      },
    ];
  }

  fillToolbar() {
    this.customToolbar = {
      showNumResults: true,
      numResultsTextBase: `${this.translate.transform('admin.processing.total')}: #`,
      showNewButton: true,
      showNewButtonText: this.translate.transform('admin.processing.add'),
    };
  }

  fillCustomGridModel() {
    this.customGridModel = {
      dataSource: this.filteredProcessingTypes(),
      columns: this.columns,
      toolbarModel: this.customToolbar,
      idField: 'id',
      pageSize: 1000,
      withoutPaging: true,
      innerScrollHeight: '46vh',
      filterStringInitial: this.searchText(),
      key: 'processing',
    };
  }
  //#endregion custom-grid actions
}
