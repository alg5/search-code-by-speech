import { Component, effect, inject, signal, OnInit } from '@angular/core';
import { IProductCategory } from '../../../../shared/models/product.model';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  GridColumType,
  IColumn,
  ICustomGridModel,
} from '../../../../shared/components/custom-components/custom-grid/custom-grid-models';
import { IToolbarModel } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar-models';
import { CustomGridComponent } from '../../../../shared/components/custom-components/custom-grid/custom-grid.component';
import { CustomToolbarService } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { CustomGridService } from '../../../../shared/components/custom-components/custom-grid/custom-grid.service';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { ToastModule } from 'primeng/toast';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'spr-admin-categories',
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
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss',
})
export class AdminCategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private readonly supabaseService = inject(SupabaseService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toolbarService = inject(CustomToolbarService);
  private readonly customGridService = inject(CustomGridService);
  private readonly messageService = inject(MessageService);
  private readonly languageService = inject(LanguageService);
  private readonly translate = inject(TranslatePipe);

  // State
  categories = signal<IProductCategory[]>([]);
  filteredCategories = signal<IProductCategory[]>([]);
  loading = signal(false);
  submited = signal(false);
  searchText = signal('');

  // Dialog
  dialogVisible = signal(false);

  // Form
  fg = this.fb.group({
    code: ['', Validators.required],
    name_en: ['', Validators.required],
    name_ru: ['', Validators.required],
    name_he: [''],
    name_fr: [''],
    priority: [null],
  });

  //#region custom-grid definition

  customGridModel!: ICustomGridModel;
  customToolbar!: IToolbarModel;
  columns!: IColumn[];

  //#endregion custom-grid definition

  constructor() {
    // Toolbar new button click
    effect(() => {
      const event = this.toolbarService.newButtonClickedSignal();
      if (!event?.value) return;
      if (event.key !== 'categories') return; // filter by component key

      this.openAdd();
    });

    // Grid row delete
    effect(() => {
      const event = this.customGridService.rowDeleteSignal();
      if (!event?.row) return;
      if (event.key !== 'categories') return;
      this.confirmDelete(event.row);
    });

    // Grid row save
    effect(() => {
      const event = this.customGridService.saveEditedRowSignal();
      if (!event?.row) return;
      if (event.key !== 'categories') return;
      this.saveEdit(event.row);
    });

    // Search filter
    effect(() => {
      const text = this.searchText()?.toLowerCase() || '';
      if (!this.customGridModel) return;

      const filtered = this.categories().filter(
        (p) =>
          !text ||
          p.code?.toLowerCase().includes(text) ||
          p.name_en?.toLowerCase().includes(text) ||
          p.name_ru?.toLowerCase().includes(text) ||
          p.name_he?.toLowerCase().includes(text) ||
          p.name_fr?.toLowerCase().includes(text),
      );

      this.filteredCategories.set(filtered);

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
    this.loadCategories();
  }

  async loadCategories() {
    try {
      const data = await this.supabaseService.getProductCategories();
      this.categories.set(data);
      this.filteredCategories.set(data);
    } finally {
      this.loading.set(false);
      this.submited.set(false);
      this.fillCustomGridModel();
    }
  }

  // ===== ADD =====
  openAdd() {
    this.fg.reset({ priority: null });
    this.dialogVisible.set(true);
  }

  async saveNew() {
    this.submited.set(true);

    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    try {
      await this.supabaseService.insertProductCategory(this.fg.value as IProductCategory);

      this.dialogVisible.set(false);
      this.loadCategories();

      this.messageService.add({
        severity: 'success',
        summary: this.translate.transform('message.success.categories.created'),
      });
    } catch (error: any) {
      if (error?.code === '23505') {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.transform('message.error'),
          detail: this.languageService.translate('message.error.categories.duplicateCode', '', {
            code: this.fg.get('code')?.value,
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

  // ===== EDIT =====
  async saveEdit(row: IProductCategory) {
    try {
      await this.supabaseService.updateProductCategory(row);
      this.loadCategories();

      this.messageService.add({
        severity: 'success',
        summary: this.translate.transform('message.success.categories.updated'),
      });
    } catch (error: any) {
      if (error?.code === '23505') {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.transform('message.error'),
          detail: this.languageService.translate('message.error.categories.duplicateCode', '', {
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

  // ===== Delete =====
  confirmDelete(row: IProductCategory) {
    this.confirmationService.confirm({
      message: `${this.translate.transform('admin.categories.confirmDelete')} ${row.code}?`,
      acceptLabel: this.translate.transform('message.yes'),
      rejectLabel: this.translate.transform('message.no'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await this.supabaseService.deleteProductCategory(row.id);
          this.loadCategories();
          this.messageService.add({
            severity: 'success',
            detail: this.translate.transform('message.success.categories.deleted'),
          });
        } catch (error: any) {
          if (error?.code === '23503') {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.transform('message.error'),
              detail: this.translate.transform('message.error.categories.deleteHasProducts'),
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
  private fillColumns() {
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

  private fillToolbar() {
    this.customToolbar = {
      showNumResults: true,
      numResultsTextBase: `${this.translate.transform('admin.categories.total')}: #`,
      showNewButton: true,
      showNewButtonText: this.translate.transform('admin.categories.add'),
    };
  }

  private fillCustomGridModel() {
    this.customGridModel = {
      dataSource: this.filteredCategories(),
      columns: this.columns,
      toolbarModel: this.customToolbar,
      idField: 'id',
      pageSize: 1000,
      withoutPaging: true,
      filterStringInitial: this.searchText(),
      innerScrollHeight: '46vh',
      key: 'categories',
    };
  }
}
