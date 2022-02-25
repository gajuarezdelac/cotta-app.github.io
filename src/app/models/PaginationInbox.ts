export class PaginationInbox {

    numberPage: number;
    sizePage: number;
    subject : string;
    content : string;
    email : string;

    
    constructor() {
      this.numberPage = 0;
      this.sizePage = 10;
      this.subject = '';
      this.content = '';
      this.email = '';
    }
    
  }