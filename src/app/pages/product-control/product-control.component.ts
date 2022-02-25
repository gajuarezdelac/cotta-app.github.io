import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { Content, ProductPaginate } from 'src/app/models/ProductPaginate';
import { Product } from 'src/app/models/Product';
import { NzModalService } from 'ng-zorro-antd/modal';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { NzImageService } from 'ng-zorro-antd/image';

@Component({
  selector: 'app-product-control',
  templateUrl: './product-control.component.html',
  styleUrls: ['./product-control.component.css']
})
export class ProductControlComponent implements OnInit {


  // * Variables de la tabla
  public pageSize: number = 10;
  public current: number = 1;
  public subscriptions: Subscription[] = [];
  public total: number = 0;
  public totalElementByPage = 0;

  public data: Content[] = [];
  public temp: Content[] = [];
  public isLoadingTable = false;

  // * Variables para visualizar la orden

  public visibleDrawer = false;
  public isLoadingDrawer = false;
  public viewElement: Product | undefined = undefined;

  // * Variables para cambiar el estatus de la orden


  // * Variables para generar el reporte
  public isLoadingGeneral = false;

  // * Variables para realizar el filtrado de busqueda
  public validateForm!: FormGroup;

  // * Variables para agregar un nuevo producto  
  public createForm!: FormGroup;
  @ViewChild('f') myForm: NgForm | undefined;
  public visibleCreateDrawer = false;
  public isLoadingCreateDrawer = false;
  public isCalzado: any = null;

  // * Variables para editar un producto
  public editForm!: FormGroup;
  @ViewChild('e') editNgForm: NgForm | undefined;
  public visibleEditDrawer = false;
  public isLoadingEditDrawer = false;
  public currentId: string | undefined = undefined;
  public imagesById: any = [];

  // ! Subir imagenes
  public files: any[] = [];

  // ! Product by code
  public isLoadingProductByCode = false;
  public isVisibleProductByCode = false;
  public codeForm!: FormGroup;
  @ViewChild('p') codeNgForm: NgForm | undefined;




  constructor(
    private authenticationService: AuthService,
    private fb: FormBuilder,
    private modal: NzModalService,
    private nzImageService: NzImageService,
    private message: NzMessageService,
    private router: Router,
    private productService: ProductService) { }

  ngOnInit(): void {

    this.codeForm = this.fb.group({
      code: ['', Validators.required],
    })

    this.createForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      price: [0, Validators.required],
      category: ['', Validators.required],
      typeGarment: ['', Validators.required],
      typeClothing: ['', Validators.required],
      discount: [0, Validators.required],
      shortDescription: ['', Validators.required],
      size: ['', Validators.required],
      cantd: [0, Validators.required],
    });

    this.editForm = this.fb.group({
      id: ['', Validators.required],
      code: [{ value: '', disabled: true }, Validators.required],
      name: ['', Validators.required],
      price: [0, Validators.required],
      category: ['', Validators.required],
      typeGarment: ['', Validators.required],
      typeClothing: ['', Validators.required],
      discount: [0, Validators.required],
      shortDescription: ['', Validators.required],
      size: ['', Validators.required],
      cantd: [0, Validators.required],
    });

    this.validateForm = this.fb.group({
      codeProd: [''],
      description: [''],
      name: [''],
      category: ['']
    });

    this.getListPaginate();
  }

  // ! Search 

  submitForm(): void {

    for (const i in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(i)) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
    }

    if (!this.validateForm.valid) {
      return;
    }

    if (this.current >= 1) {
      this.current = 1;
    }


    this.isLoadingTable = true;
    let form = this.validateForm.value;

    this.subscriptions.push(
      this.productService.getAllProductsPaginate({ numberPage: (this.current - 1), sizePage: this.pageSize, codeProd: form.codeProd, description: form.description, name: form.name, category: form.category }).subscribe(
        (response: ProductPaginate) => {
          this.temp = response.content;
          this.data = response.content;
          this.total = response.totalElements;
          this.totalElementByPage = response.numberOfElements;
          this.isLoadingTable = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingTable = false;
          this.message.create("error", "Ha ocurrido un error!");
        }
      )
    );
  }



  // ! Listado de registros para llenar la tabla 
  getListPaginate(): void {
    this.isLoadingTable = true;
    this.subscriptions.push(
      this.productService.getAllProductsPaginate({ numberPage: (this.current - 1), sizePage: this.pageSize, codeProd: this.validateForm.value["codeProd"], description: this.validateForm.value["description"], name: this.validateForm.value["name"], category: this.validateForm.value["category"] }).subscribe(
        (response: ProductPaginate) => {
          this.temp = response.content;
          this.data = response.content;
          this.total = response.totalElements;
          this.totalElementByPage = response.numberOfElements;
          this.isLoadingTable = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingTable = false;
          this.message.create("error", "Ha ocurrido un error!");
        }
      )
    );
  }

  changePageSize($event: number): void {
    console.log("Change page size: " + $event);
    this.pageSize = $event;
    this.getListPaginate();
  }

  changeCurrentPage($event: number): void {
    console.log("Change page: " + $event);
    this.current = $event;
    this.getListPaginate();
  }

  // ! Visualizar orden o pedido
  getElementById(id: string): void {
    this.isLoadingDrawer = true;
    this.subscriptions.push(
      this.productService.getProductById(id).subscribe(
        (response: Product) => {
          this.viewElement = response;

          this.imagesById = response.images.map(rec => {
            return {
              src: rec.routeFile,
              width: '500px',
              height: '400px',
              alt: 'ng-zorro'
            }
          });



          this.isLoadingDrawer = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingDrawer = false;
          this.message.create("error", "Ha ocurrido un error!");
        }
      )
    );
  }


  viewImages(): void {
    this.nzImageService.preview(this.imagesById, { nzZoom: 1.5, nzRotate: 0 });
  }

  openViewDrawer(element: Content): void {
    this.getElementById(element.id);
    this.visibleDrawer = true;
  }

  closeViewDrawer(): void {
    this.visibleDrawer = false;
    this.viewElement = undefined;
    this.imagesById = [];
  }


  // ! Eliminar pedido
  deleteMessageById(id: string): void {
    this.isLoadingGeneral = true;
    this.subscriptions.push(
      this.productService.deleteProduct(id).subscribe(
        (response: Content) => {
          this.message.create("success", "Se elimino de manera correcta!");

          // Con esto evitamos que se quede vacio cuando aun existen registros en la página 1.
          if (this.totalElementByPage == 1 && this.current != 1) {
            this.current -= 1;
          }

          this.getListPaginate();
          this.isLoadingGeneral = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingGeneral = false;
          this.message.create("error", "Ha ocurrido un error!");
        }
      )
    );
  }

  showDeleteConfirm(element: Content): void {
    this.modal.confirm({
      nzTitle: '¿Estas seguro de eliminar el producto?',
      nzContent: '<b style="color: red;"> Una vez eliminado no sera posible recupearlo! </b>',
      nzOkText: 'Eliminar',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteMessageById(element.id),
      nzCancelText: 'Cerrar',
      nzOnCancel: () => console.log('Cancel')
    });
  }


  // ! Crear

  createSubmit() {

    for (const i in this.createForm.controls) {
      if (this.createForm.controls.hasOwnProperty(i)) {
        this.createForm.controls[i].markAsDirty();
        this.createForm.controls[i].updateValueAndValidity();
      }
    }

    if (!this.createForm.valid) {
      return;
    }

    // Validando imagenes
    this.isLoadingCreateDrawer = true;
    let form = this.createForm.value;
    let totalSize = 0;
    const formData = this.productService.createFormDate('', form);
    this.files.forEach(file => {
      formData.append('images', file, file.name)
      totalSize += file.size;
    })

    if (totalSize / 1024 / 1024 >= 9.99) {
      this.message.create("warning", "Las imagenes son demasiado grandes");
      this.isLoadingCreateDrawer = false;
      return;
    }

    if (this.files.length < 3) {
      this.message.create("warning", "Es necesario agregar por lo minimo 3 imagenes");
      this.isLoadingCreateDrawer = false;
      return;
    }

    this.subscriptions.push(
      this.productService.createProduct(formData).subscribe(
        (response: Product) => {
          this.getListPaginate();
          this.message.create("success", "Producto creado de manera correcta");
          this.closeCreateDrawer();
          this.createForm.reset();
          this.files = [];
          this.isLoadingCreateDrawer = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingCreateDrawer = false;
          this.message.create("error", errorResponse.error.message);
        }
      )
    );
  }

  openCreateDrawer(): void {
    this.visibleCreateDrawer = true;
  }

  closeCreateDrawer(): void {
    this.visibleCreateDrawer = false;
  }


  // ! Change

  onChangeType(event: any): void {
    if (event == '1') {
      this.isCalzado = true;
    } else {
      this.isCalzado = false;
    }
  }


  // ! Editar pedido

  editSubmit() {
    for (const i in this.editForm.controls) {
      if (this.editForm.controls.hasOwnProperty(i)) {
        this.editForm.controls[i].markAsDirty();
        this.editForm.controls[i].updateValueAndValidity();
      }
    }

    if (!this.editForm.valid) {
      return;
    }

    this.isLoadingEditDrawer = true;
    let form = this.editForm.value;
    const formData = this.productService.createFormDate(this.currentId!, form);

    this.subscriptions.push(
      this.productService.updateProduct(formData).subscribe(
        (response: Product) => {
          this.getListPaginate();
          this.message.create("success", "Producto actualizado de manera correcta!");
          this.closeEditDrawer();
          this.isLoadingEditDrawer = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingEditDrawer = false;
          this.message.create("error", errorResponse.error.message);
        }
      )
    );
  }

  openEditDrawer(element: Content): void {
    this.getElementById(element.id);
    this.currentId = element.id;
    this.visibleEditDrawer = true;
  }

  closeEditDrawer(): void {
    this.visibleEditDrawer = false;
    this.viewElement = undefined;
    this.currentId = undefined;
  }

  // ! Find element

  showModal(): void {
    this.isVisibleProductByCode = true;
  }

  handleCancel(): void {
    this.isVisibleProductByCode = false;
  }

  submitFindProductByCode() {

    for (const i in this.codeForm.controls) {
      if (this.codeForm.controls.hasOwnProperty(i)) {
        this.codeForm.controls[i].markAsDirty();
        this.codeForm.controls[i].updateValueAndValidity();
      }
    }

    if (!this.codeForm.valid) {
      return;
    }

    // Validando imagenes
    this.isLoadingProductByCode = true;
    let form = this.codeForm.value;

    this.subscriptions.push(
      this.productService.getProductByCode(form.code).subscribe(
        (response: Product) => {
          this.message.create("success", "Producto encontrado!");
          this.handleCancel();
          this.isLoadingProductByCode = false;
          this.codeForm.reset();
          this.fillForm(response);
          console.log(response);
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingProductByCode = false;
          this.message.create("error", errorResponse.error.message);
        }
      )
    );
  }

  public fillForm(element :  Product) {

    if (element.typeClothing == '1') {
      this.isCalzado = true;
    } else {
      this.isCalzado = false;
    }
    
    this.createForm = this.fb.group({
      code: [element.code, Validators.required],
      name: [element.name, Validators.required],
      price: [element.price, Validators.required],
      category: [element.category, Validators.required],
      typeGarment: [element.typeGarment, Validators.required],
      typeClothing: [element.typeClothing, Validators.required],
      discount: [element.discount, Validators.required],
      shortDescription: [element.shortDescription, Validators.required],
      size: [null, Validators.required],
      cantd: [0, Validators.required],
    });



  }






  // ! Upload multiple images

  /**
* on file drop handler
*/
  onFileDropped($event: any) {
    console.log($event);
    // this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files: any) {
    let list = files.target.files;
    this.prepareFilesList(list);
  }

  /**
  * Delete file from files list
  * @param index (File index)
  */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  /**
 * Simulate the upload process
 */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 50);
      }
    }, 100);
  }

  /**
   * Simulate the upload process
   * @param file (File select)
   */
  viewFile(e: any) {
    let file = new Blob([e], { type: e.type })
    var fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  }

  /**
  * Convert Files list to normal array list
  * @param files (Files List)
  */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
    this.uploadFilesSimulator(0);
  }


  handleOk() {

  }



  // ! Generar reporte


  generateExcel(): void {

    this.isLoadingGeneral = true;
    this.subscriptions.push(
      this.productService.getAllProducts().subscribe(
        (response: Content[]) => {

          let newJson = response.map(rec => {
            return {
              'ID': rec.id,
              'Asunto': rec.id,
              'Email': rec.id,
              'Enviado': this.getFormatedDate(rec.createdAt, "MM/dd/yyyy"),
              "Mensaje": rec.id
            }
          });

          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(newJson);
          /* generate workbook and add the worksheet */
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          /* save to file */
          XLSX.writeFile(wb, "Mensajes.xlsx");
          this.isLoadingGeneral = false;

        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoadingGeneral = false;
          this.message.create("error", "Ha ocurrido un error!");
        }
      )
    );
  }

  // ! Get clasification by key
  public getClasificacionByKey(key: string): string {

    if (key == "1") { return "Deportiva"; }
    if (key == "2") { return "Interior"; }
    if (key == "3") { return "Etiqueta"; }
    if (key == "4") { return "Casual"; }
    if (key == "5") { return "Trabajo"; }
    if (key == "6") { return "Uniformes"; }

    return "N/A"
  }

  // ! Get category by key
  public getCategoryByKey(key: string) {
    if (key == "1") { return "Hombre"; }
    if (key == "2") { return "Jovenes"; }
    if (key == "3") { return "Mujer"; }
    if (key == "4") { return "Unisex"; }
    return "N/A"
  }

  // ! Get Type Clothing
  public getTypeClothingByKey(key: string) {
    if(key == "1"){return "Calzado";} 
    if(key == "2"){return "Ropa";} 
    if(key == "3"){return "Accesorios";} 
    return "N/A"
  }

  private getFormatedDate(date: Date, format: string) {
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(date, format);
  }




}
