
export class Order {

    id: string;
    userId: string;
    amount: number;
    listProducts: string[];
    status: number;
    createdAt: string;
    editAt?: any;

    constructor() {
        this.id = '';
        this.userId = ''
        this.amount = 0;
        this.listProducts = [];
        this.status = 0;
        this.createdAt = '';
        this.editAt = '';
    }
    
}