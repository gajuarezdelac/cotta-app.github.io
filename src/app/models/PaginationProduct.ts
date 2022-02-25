export class PaginationProduct {

    numberPage: number;
    sizePage: number;
    codeProd : string;
    description: string;
    name : string;
    category: string;
    
    constructor() {
      this.numberPage = 0;
      this.sizePage = 10;
      this.codeProd = '';
      this.description = '';
      this.name = '';
      this.category = '';
    }
  }