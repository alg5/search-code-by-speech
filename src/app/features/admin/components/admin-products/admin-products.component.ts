import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { CustomGridComponent } from '../../../../shared/components/custom-components/custom-grid/custom-grid.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { CustomToolbarService } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar.service';
import { CustomGridService } from '../../../../shared/components/custom-components/custom-grid/custom-grid.service';
import { IProduct, IProductCategory, IProductProcessing } from '../../../../shared/models/product.model';
import { GridColumType, IColumn, ICustomGridModel } from '../../../../shared/components/custom-components/custom-grid/custom-grid-models';
import { IToolbarModel } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar-models';
import { IDropDownModel } from '../../../../shared/components/custom-components/custom-dropdown/custom-dropdown-models';
import { LanguageService } from '../../../../core/services/language.service';
import { CustomDropdownComponent } from '../../../../shared/components/custom-components/custom-dropdown/custom-dropdown.component';
import { ISelectOption } from '../../../../shared/models/generalModels';
import { ToastModule } from 'primeng/toast';
import Helper from '../../../../shared/utils/helper';
import { DrawerModule } from 'primeng/drawer';
import { FoodLoaderComponent } from '../../../../shared/components/loaders/food-loader/food-loader.component';
import { IButtonModel } from '../../../../shared/components/custom-components/custom-button/custom-button-models';
import { CustomButtonComponent } from '../../../../shared/components/custom-components/custom-button/custom-button.component';

@Component({
  selector: 'spr-admin-products',
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
    CustomDropdownComponent,
    TranslatePipe,
    ToastModule,
    DrawerModule,
    FoodLoaderComponent,
    CustomButtonComponent
  ],
  providers: [ConfirmationService, TranslatePipe],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
})
export class AdminProductsComponent {
  private readonly supabaseService = inject(SupabaseService);
  private readonly fb = inject(FormBuilder);
  private readonly customGridService = inject(CustomGridService);
  private readonly langService = inject(LanguageService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslatePipe);

  products = signal<IProduct[]>([]);
  filteredProducts = signal<IProduct[]>([]);
  loading = signal(false);
  submited = signal(false);

  sidebarVisible = signal(false);
  editingProduct = signal<IProduct | null>(null);
  originalProduct = signal<IProduct | null>(null);

  fg: FormGroup;

  // For display only
  originalPriority = computed(() => {
    const product = this.originalProduct();
    if (!product) return 0;
    return Helper.calculatePriority(product, this.kCategory(), this.kProcessing());
  });

  calculatedPriority = computed(() => {
    const product = this.editingProduct();
    if (!product) return 0;
    return Helper.calculatePriority(product, this.kCategory(), this.kProcessing());
  });

  // Detect if category or processing changed
  isClassificationChanged = computed(() => {
    const original = this.originalProduct();
    const current = this.editingProduct();

    if (!original || !current) return false;

    return (
      original.category_code !== current.category_code ||
      original.processing_code !== current.processing_code
    );
  });

  // Add button models
  saveButtonModel = signal<IButtonModel>({
    label: this.translate.transform('button.save'),
    buttonClass: 'p-button-primary',
    isLoading: false,
    isDisabled: true
  });

  cancelButtonModel: IButtonModel = {
    label: this.translate.transform('button.cancel'),
    buttonClass: 'p-button-secondary'
  };

  searchText = signal('');
  selectedCategory = signal<string | null>(null);
  selectedProcessing = signal<string | null>(null);

  // Signals for reference data needed by priority calculation
  categories = signal<IProductCategory[]>([]);
  processingList = signal<IProductProcessing[]>([]);

  // Values for ngModel
  selectedCategoryValue: string | null = null;
  selectedProcessingValue: string | null = null;

  categoryModelGrid: IDropDownModel;
  categoryModelFilter: IDropDownModel;
  processingModelGrid: IDropDownModel;
  processingModelFilter: IDropDownModel;

  //#region custom-grid definition
  customGridModel: ICustomGridModel;
  customToolbar: IToolbarModel;
  columns: IColumn[];
  //#endregion custom-grid definition

  constructor() {
    effect(() => {
      const event = this.customGridService.saveEditedRowSignal();
      if (!event?.row) return;
      console.log('Save signal received in AdminProductsComponent', event.row);
      this.saveEdit(event.row);
    });

    effect(() => {
      const event = this.customGridService.gridCellClickedSignal();

      // Reset signal immediately to prevent re-processing
      if (event) {
        this.customGridService.gridCellClickedSignal.set(null);
      }

      if (!event?.row) return;

      // All writes in untracked - effect won't track them
      untracked(() => {
        this.editingProduct.set(event.row);
        this.initFormControls();
        this.sidebarVisible.set(true);
      });
    });

    effect(() => {
      const pageEvent = this.customGridService.pagingSignal();
      if (!pageEvent || pageEvent.key !== 'products') return;
      
      this.currentPage.set(pageEvent.page);
      this.loadProducts(); 
    });

    

  effect(() => {
    const text = this.searchText();
    const cat = this.selectedCategory();
    const proc = this.selectedProcessing();
    
    // Reset to page 1 when filters change
    untracked(() => {
        this.currentPage.set(1);
        this.loadInit();
      });
    });
  }
    

  ngOnInit(): void {
    this.loadInit();
  }

totalRecords = signal(0);
currentPage = signal(1);
pageSize = 15;

// Coefficients for priority calculation
kCategory = signal(0);
kProcessing = signal(0);

async loadInit() {
  try {
    this.loading.set(true);

    const [{ products, totalCount }, categories, processing, kCat, kProc] = await Promise.all([
      this.supabaseService.getAdminProductsPage(
        this.searchText(),
        this.currentPage() - 1,
        this.pageSize,
        this.selectedCategory(),
        this.selectedProcessing()
      ),
      this.supabaseService.getProductCategories(),
      this.supabaseService.getProductProcessing(),
      this.supabaseService.getConfigValue('search.k_category'),
      this.supabaseService.getConfigValue('search.k_processing')
    ]);

    // Set current coefficients from config (0 if not set)
    this.kCategory.set(parseFloat(kCat) || 0);
    this.kProcessing.set(parseFloat(kProc) || 0);

    this.categories.set(categories);
    this.processingList.set(processing);
    this.products.set(products);
    this.filteredProducts.set(products);
    this.totalRecords.set(totalCount);

    const lang = this.langService.getLang().code;

    // Category dropdown
    const sortedCategories = this.sortByPriorityAndName(
      categories,
      c => this.getLocalizedName(c)
    );
    const categoryOptionsBase: ISelectOption[] = sortedCategories.map(c => ({
      Value: c.code,
      Text: `${c.priority} - ${this.getLocalizedName(c)}`,
      Selected: false
    }));

    this.categoryModelGrid = {
      options: [
        { Text: this.translate.transform('admin.categories.without'), Value: null, Selected: false },
        ...categoryOptionsBase
      ],
      placeholder: this.translate.transform('admin.categories'),
      floatLabel: true
    };
    this.categoryModelFilter = {
      options: [
        { Text: this.translate.transform('admin.categories.all'), Value: null, Selected: false },
        ...categoryOptionsBase
      ],
      placeholder: this.translate.transform('admin.categories'),
      floatLabel: true
    };

    // Processing dropdown
    const sortedProcessing = this.sortByPriorityAndName(
      processing,
      p => this.getLocalizedName(p)
    );

    const processingOptionsBase: ISelectOption[] = sortedProcessing.map(p => ({
      Value: p.code,
      Text: `${p.priority} - ${this.getLocalizedName(p)}`,
      Selected: false
    }));

    this.processingModelGrid = {
      options: [
        { Text: this.translate.transform('admin.processing.without'), Value: null, Selected: false },
        ...processingOptionsBase
      ],
      placeholder: this.translate.transform('admin.processing'),
      floatLabel: true
    };
    this.processingModelFilter = {
      options: [
        { Text: this.translate.transform('admin.processing.all'), Value: null, Selected: false },
        ...processingOptionsBase
      ],
      placeholder: this.translate.transform('admin.processing'),
      floatLabel: true
    };

  } finally {
    this.loading.set(false);
    this.createForm();
    this.fillColumns();
    this.fillToolbar();
    this.fillCustomGridModel();
  }
}

// Called on pagination or search - only reloads products
async loadProducts() {
  try {
    this.loading.set(true);

    const { products, totalCount } = await this.supabaseService.getAdminProductsPage(
      this.searchText(),
      this.currentPage() - 1,
      this.pageSize,
      this.selectedCategory(),
      this.selectedProcessing()
    );

    this.products.set(products);
    this.filteredProducts.set(products);
    this.totalRecords.set(totalCount);

  } finally {
    this.loading.set(false);
    this.fillCustomGridModel();
  }
}

  createForm() {
    this.fg = this.fb.group({
      key_en: new FormControl(null, Validators.required),
      key_ru: new FormControl(null, Validators.required),
      key_he: new FormControl(null, Validators.required),
      key_fr: new FormControl(null, Validators.required),
      category_code: new FormControl(null),
      processing_code: new FormControl(null)
    });

    // Track any form change
    this.fg.valueChanges.subscribe(() => {
      this.saveButtonModel.update(model => ({
        ...model,
        isDisabled: !this.checkFormDirty()
      }));
    });

    // Subscribe to selected changes
    this.fg.get('category_code')?.valueChanges.subscribe(code => {
      const current = this.editingProduct();
      if (!current) return;

      const category = this.categories().find(c => c.code === code);
      this.editingProduct.set({
        ...current,
        category_code: code,
        category,
        category_priority: category?.priority ?? 0  // Add flat field
      });
    });

    this.fg.get('processing_code')?.valueChanges.subscribe(code => {
      const current = this.editingProduct();
      if (!current) return;

      const processing = this.processingList().find(p => p.code === code);
      this.editingProduct.set({
        ...current,
        processing_code: code,
        processing,
        processing_priority: processing?.priority ?? 0  // Add flat field
      });
    });
  }

  initFormControls() {
    const product = this.editingProduct();
    if (!product) return;

    // Freeze original product for dirty check
    this.originalProduct.set({ ...product });

    this.fg.setValue({
      key_en: product.key_en,
      key_ru: product.key_ru,
      key_he: product.key_he,
      key_fr: product.key_fr,
      category_code: product.category_code,
      processing_code: product.processing_code
    });

    // Reset button state
    this.saveButtonModel.update(model => ({
      ...model,
      isDisabled: true,
      isLoading: false
    }));
  }

  recalculatePriority() {
    // Computed will recalculate on next read
  }

  private getLocalizedName(item: IProductCategory | IProductProcessing) {
    const lang = this.langService.getLang().code;
    const fieldName = `name_${lang}` as keyof (IProductCategory | IProductProcessing);
    return item[fieldName] as string || item.code;
  }

onSearchChange(text: string) {
  this.searchText.set(text);
  this.currentPage.set(1);
  this.loadProducts();
}

onCategoryChange(value: string | null) {
  this.selectedCategoryValue = value;
  this.selectedCategory.set(value);
  this.currentPage.set(1);
  this.loadProducts();
}

onProcessingChange(value: string | null) {
  this.selectedProcessingValue = value;
  this.selectedProcessing.set(value);
  this.currentPage.set(1);
  this.loadProducts();
}

  private checkFormDirty(): boolean {
    const original = this.originalProduct();
    if (!original) return false;

    const current = this.fg.value;

    return (
      current.key_en !== original.key_en ||
      current.key_ru !== original.key_ru ||
      current.key_he !== original.key_he ||
      current.key_fr !== original.key_fr ||
      current.category_code !== original.category_code ||
      current.processing_code !== original.processing_code
    );
  }

  // ===== EDIT INLINE =====

  async onClickSaveEdit() {
    if (this.fg.invalid) {
      this.submited.set(true);
      return;
    }

    this.saveButtonModel.set({
      ...this.saveButtonModel(),
      isLoading: true,
      isDisabled: true
    });

    try {
      const updatedProduct = {
        ...this.editingProduct(),
        ...this.fg.value
      } as IProduct;
      delete updatedProduct.category;
      delete updatedProduct.processing;

      await this.saveEdit(updatedProduct);

      this.sidebarVisible.set(false);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.transform('message.success'),
        detail: this.translate.transform('message.success.products.updated')
      });

    } catch (e: any) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.transform('message.error'),
        detail: e?.message || this.translate.transform('message.unexpectedError')
      });
    } finally {
      this.saveButtonModel.set({
        ...this.saveButtonModel(),
        isLoading: false,
        isDisabled: !this.checkFormDirty()
      });
    }
  }

  onClickCancelEdit() {
    this.sidebarVisible.set(false);
    // TODO: reset form values
    this.fg.reset();
  }

  async saveEdit(product: IProduct) {
    await this.supabaseService.updateProduct(product);
    this.loadInit();
  }

  //#region custom-grid actions

  fillColumns() {
    this.columns = [
      {
        headerText: 'ID',
        dataField: 'id',
        dataType: GridColumType.numeric,
        width: '60px',
        minWidth: '60px'
      },
      {
        headerText: this.translate.transform('column.productCode'),
        dataField: 'scale_code',
        dataType: GridColumType.numeric,
        isColFiltering: true,
        width: '80px',
        minWidth: '80px'
      },
      {
        headerText: this.translate.transform('column.productName'),
        dataField: 'product_name',
        isColFiltering: true,
        width: '160px',
        maxWidth: '160px',
        rowClass: 'col-ellipsis'
      },
      {
        headerText: this.translate.transform('column.nameEn'),
        dataField: 'key_en',
        dataType: GridColumType.textEditable,
        isColFiltering: true,
        width: '140px',
        maxWidth: '140px',
        rowClass: 'col-ellipsis'
      },
      {
        headerText: this.translate.transform('column.nameRu'),
        dataField: 'key_ru',
        dataType: GridColumType.textEditable,
        isColFiltering: true,
        width: '140px',
        maxWidth: '140px',
        rowClass: 'col-ellipsis'
      },
      {
        headerText: this.translate.transform('column.nameHe'),
        dataField: 'key_he',
        dataType: GridColumType.textEditable,
        isColFiltering: true,
        width: '140px',
        maxWidth: '140px',
        rowClass: 'col-ellipsis'
      },
      {
        headerText: this.translate.transform('column.nameFr'),
        dataField: 'key_fr',
        dataType: GridColumType.textEditable,
        isColFiltering: true,
        width: '140px',
        maxWidth: '140px',
        rowClass: 'col-ellipsis'
      },
      {
        headerText: this.translate.transform('column.categoryCode'),
        dataField: 'category_code',
        dataType: GridColumType.dropdownEditable,
        width: '140px',
        maxWidth: '140px',
        rowClass: 'col-ellipsis',
        formattedOptions: { dropdown: this.categoryModelGrid }
      },
      {
        headerText: this.translate.transform('column.processingCode'),
        dataField: 'processing_code',
        dataType: GridColumType.dropdownEditable,
        width: '140px',
        maxWidth: '140px',
        rowClass: 'col-ellipsis',
        formattedOptions: { dropdown: this.processingModelGrid }
      },
      {
        headerText: this.translate.transform('column.priority'),
        dataField: 'priority',
        dataType: GridColumType.calculated,
        width: '80px',
        minWidth: '60px',
        tooltip: this.translate.transform('tooltip.priority'),
        calculateValue: (rowData: IProduct) => Helper.calculatePriority(rowData, this.kCategory(), this.kProcessing())
      },
      {
        headerText: '',
        dataField: 'pi-pencil',
        dataType: GridColumType.imgPrimengIconClick,
        width: '50px',
        minWidth: '50px',
        formattedOptions: { primengIcon: 'pi-pencil' }
      },
    ];
  }  

  fillToolbar() {
    this.customToolbar = {
      showNumResults: true,
      numResultsTextBase: `${this.translate.transform('admin.products.total')}: #`,
    };
  }

  fillCustomGridModel() {
    // this.customGridModel = {
    //   dataSource: [...this.filteredProducts()],
    //   columns: [...this.columns],
    //   toolbarModel: { ...this.customToolbar },
    //   pageSize: 15,
    //   // withoutPaging: true,
    //   innerScrollHeight: '46vh',
    //   filterStringInitial: this.searchText(),
    //   idField: 'id',
    //   key: 'products'
    // };
    this.customGridModel = {
      dataSource: [...this.filteredProducts()],
      columns: [...this.columns],
      toolbarModel: { ...this.customToolbar },
      pageSize: this.pageSize,
      pageIndex: this.currentPage() - 1, // PrimeNG 0-based
      pagingAPI: true,
      totalRecords: this.totalRecords(),
      innerScrollHeight: '46vh',
      filterStringInitial: this.searchText(),
      idField: 'id',
      key: 'products'
    };
  }

  //#endregion custom-grid actions

  private sortByPriorityAndName<T extends { priority?: number | null }>(
    items: T[],
    getName: (item: T) => string
  ): T[] {
    return [...items].sort((a, b) => {
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;

      if (priorityB !== priorityA) {
        return priorityB - priorityA;
      }

      const nameA = getName(a).toLowerCase();
      const nameB = getName(b).toLowerCase();

      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  }
  onPageChange(event: any) {
    this.currentPage.set(event.page + 1); // PrimeNG uses 0-based
    this.loadInit();
  }
}