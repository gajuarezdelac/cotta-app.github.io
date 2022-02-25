export class PaginationOrder {

    numberPage: number;
    sizePage: number;
    id: string;
    userId : string;
    dateBegin : string;
    dateFinish : string;
    
    constructor() {
      this.numberPage = 0;
      this.sizePage = 10;
      this.id = '';
      this.userId = '';
      this.dateBegin = '';
      this.dateFinish = '';
    }

  }