export class PaginationUser {

    numberPage: number;
    sizePage: number;
    names:  string;
    surnames : string;
    username : string;
    
    constructor() {
      this.names = '';
      this.surnames = '';
      this.username = '';
      this.numberPage = 0;
      this.sizePage = 10;
    }
  }