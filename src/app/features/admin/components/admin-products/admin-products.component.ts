import { Component, effect, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate-pipe';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { CustomGridComponent } from '../../../../shared/components/custom-components/custom-grid/custom-grid.component';
import { ConfirmationService } from 'primeng/api';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { CustomToolbarService } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar.service';
import { CustomGridService } from '../../../../shared/components/custom-components/custom-grid/custom-grid.service';
import { IProduct, IProductCategory, IProductProcessing } from '../../../../shared/models/product.model';
import { GridColumType, IColumn, ICustomGridModel } from '../../../../shared/components/custom-components/custom-grid/custom-grid-models';
import { IToolbarModel } from '../../../../shared/components/custom-components/custom-toolbar/custom-toolbar-models';
import { IDropDownModel } from '../../../../shared/components/custom-components/custom-dropdown/custom-dropdown-models';
import { ProductsStateService } from '../../../../core/services/products-state.service';
import { LanguageService } from '../../../../core/services/language.service';
import { CustomDropdownComponent } from '../../../../shared/components/custom-components/custom-dropdown/custom-dropdown.component';
import { ISelectOption } from '../../../../shared/models/generalModels';
import { Toast, ToastModule } from 'primeng/toast';

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
    ToastModule
  ],
  providers: [ConfirmationService, TranslatePipe],  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
})
export class AdminProductsComponent {
   private readonly supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toolbarService = inject(CustomToolbarService);
  private readonly customGridService = inject(CustomGridService);
  private readonly productsState = inject(ProductsStateService);
  private readonly langService = inject(LanguageService);
  
  private readonly translate = inject(TranslatePipe);

  products = signal<IProduct[]>([]);
  filteredProducts = signal<IProduct[]>([]);
  loading = signal(false);
  submited = signal(false);

  searchText = signal('');
  selectedCategory = signal<string | null>(null);
  selectedProcessing = signal<string | null>(null);

  // 👇 значения для ngModel
  selectedCategoryValue: string | null = null;
  selectedProcessingValue: string | null = null;

  categoryModelGrid: IDropDownModel;
  categoryModelFilter: IDropDownModel;

  processingModelGrid: IDropDownModel;
  processingModelFilter: IDropDownModel;

   //#region custom-grid definition
    customGridModel:ICustomGridModel;
    customToolbar:IToolbarModel
    columns: IColumn[] ;

  //#endregion custom-grid definition


  constructor() {

    effect(() => {
      const event = this.customGridService.saveEditedRowSignal();
      if (!event?.row) return;
      console.log('Save signal received in AdminProductsComponent', event.row);
      this.saveEdit(event.row);
    });

    effect(() => {
      
      const text = this.searchText()?.toLowerCase() || '';
      const cat = this.selectedCategory();
      const proc = this.selectedProcessing();

       if(!this.customGridModel) return;
     
      
      const filtered = this.products().filter(p =>
        (
          !text ||
          p.product_name?.toLowerCase().includes(text) ||
          p.key_ru?.toLowerCase().includes(text) ||
          p.key_he?.toLowerCase().includes(text) ||
          p.scale_code?.toString().includes(text)
        ) &&
        (!cat || p.category_code === cat) &&
        (!proc || p.processing_code === proc)
      );

      this.filteredProducts.set(filtered);

      // immutable update: создаём новый gridModel, чтобы дочерний компонент увидел изменение
      this.customGridModel = {
        ...this.customGridModel,
        toolbarModel: {
          ...this.customGridModel.toolbarModel
        },
        dataSource: filtered,
        filterStringInitial: text,
        // totalRecords: filtered.length
      };



    }); 
    
  }
  ngOnInit(): void {
    this.loadInit();
  }

  async loadInit() {
  try {
    this.loading.set(true);

    const [
      products,
      categories,
      processing
    ] = await Promise.all([
      this.supabaseService.getAllProducts(),
      this.supabaseService.getProductCategories(),
      this.supabaseService.getProductProcessing()
    ]);

    // ===== products =====
    this.products.set(products);
    this.filteredProducts.set(products);

    const lang = this.langService.getLang().code;

    // ===== category dropdown =====
    const categoryOptionsBase: ISelectOption[] = categories.map(c => ({
        Value: c.code,
        Text: this.getLocalizedName(c),
        Selected: false
    }))

    // this.translate.transform('column.productCode')
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


    // ===== processing dropdown =====

    const processingOptionsBase: ISelectOption[] = processing.map(p => ({
        Value: p.code,
        Text: this.getLocalizedName(p),
        Selected: false
    }))
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

    console.log('Init loaded', {
      products,
      categories,
      processing
    });

    } finally {
      this.loading.set(false);
      // this.submited.set(false);
      this.fillColumns();
      this.fillToolbar();

      this.fillCustomGridModel(); 
    }
  }

  private getLocalizedName(item: { name_en?: string | null; name_ru?: string | null; name_he?: string | null; code: string }) {
    const lang = this.langService.getLang().code;
    if (lang === 'en') {
      return item.name_en || item.name_ru || item.name_he || item.code;
    }
    if (lang === 'he') {
      return item.name_he || item.name_ru || item.name_en || item.code;
    }
    return item.name_ru || item.name_en || item.name_he || item.code;
  }

   async loadProducts() {
    try {
       const data = await this.supabaseService.getAllProducts();
      this.products.set(data);
      console.log('Products loaded', data, this.products());
    } finally {
      this.loading.set(false);
      this.submited.set(false);
      this.fillCustomGridModel();
    }
  }

  onCategoryChange(value: string | null) {
    this.selectedCategoryValue = value;
    this.selectedCategory.set(value);
  }

  onProcessingChange(value: string | null) {
    this.selectedProcessingValue = value;
    this.selectedProcessing.set(value);
  }

  // ===== EDIT INLINE =====
   
  async saveEdit(row: IProduct) {
    const rowUpdating = { ...row }; // создаём копию, чтобы не мутировать оригинал до успешного сохранения 
    delete rowUpdating.category; // удаляем связанные объекты, которые не нужны для обновления
    delete rowUpdating.processing;
    await this.supabaseService.updateProduct(rowUpdating);
    this.loadInit();
  }

  fillColumns() {
    this.columns = [
      { 
        headerText: 'ID'
        , dataField: 'id'
        , dataType: GridColumType.numeric
      },
      { headerText: this.translate.transform('column.productCode')
        , dataField: 'scale_code'
        , dataType: GridColumType.numeric, isColFiltering: true
      },
      { headerText: this.translate.transform('column.productName'), dataField: 'product_name', isColFiltering: true },
      { headerText: this.translate.transform('column.nameRu'), dataField: 'key_ru', dataType: GridColumType.textEditable, isColFiltering: true },
      { headerText: this.translate.transform('column.nameHe'), dataField: 'key_he', dataType: GridColumType.textEditable, isColFiltering: true },
      { headerText: this.translate.transform('column.categoryCode'), dataField: 'category_code'
        , dataType: GridColumType.dropdownEditable
        ,formattedOptions: { dropdown: this.categoryModelGrid }
      },
      { headerText: this.translate.transform('column.processingCode'), dataField: 'processing_code'
        , dataType: GridColumType.dropdownEditable
        , formattedOptions: { dropdown: this.processingModelGrid }
       },
      { headerText: '', dataField: '', dataType: GridColumType.editButton},

    ];
  }
  fillToolbar() {
    this.customToolbar = {
      showNumResults: true,
      numResultsTextBase: `${this.translate.transform('admin.products.total')}: #`,
  
    }
  }
  fillCustomGridModel() {
    this.customGridModel = {
      dataSource: [...this.filteredProducts()],
      columns: [...this.columns],
      toolbarModel: { ...this.customToolbar },
      pageSize: 1000,
      withoutPaging: true,
      innerScrollHeight: '46vh',
      filterStringInitial: this.searchText(),
      // totalRecords: this.filteredProducts().length,
      idField: 'id',
      key: 'products'
    }
  }

  //#endregion custom-grid actions
  

}
