export class PaginationSearch {

    typeClothing : string;
    clasification : string;
    category: string;
    numberPage: number;
    sizePage: number;
    keyword: string;
    minPrice: number;
    maxPrice: number; 
    
    constructor() {
      this.typeClothing = '';
      this.clasification = '';
      this.category = '';
      this.keyword = '';
      this.minPrice = 0;
      this.maxPrice = 1000000;
      this.numberPage = 0;
      this.sizePage = 10;
    }
  }