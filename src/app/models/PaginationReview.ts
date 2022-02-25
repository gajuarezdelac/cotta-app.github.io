export class PaginationReview {


    numberPage: number;
    sizePage: number;
    codeProd : string;
    message: string;
    userId : string;

    constructor() {
      this.numberPage = 0;
      this.sizePage = 10;
      this.codeProd = '';
      this.message = '';
      this.userId = '';
    }
    
  }