    export class Product {
        id: string;
        code: string;
        name: string;
        shortDescription: string;
        cantd: any;
        size: string;
        price: any;
        createdAt: string;
        discount: any;
        category: string;
        rating: any;
        typeGarment: string;
        typeClothing : string;
        images: Image[];

        constructor() {
            this.id = '';
            this.code = '';
            this.name = '';
            this.shortDescription = '';
            this.cantd = 0;
            this.size = '';
            this.price = 0;
            this.createdAt = '';
            this.discount = 0;
            this.category = '';
            this.rating = 0;
            this.typeGarment = '';
            this.typeClothing = '';
            this.images = [];
        }
    }
 
    export class Image {
        id: string;
        routeFile: string;
        nameEntity: string;
        nameFile: string;

        constructor() {
            this.id = '';
            this.routeFile = '';
            this.nameEntity = '';
            this.nameFile = '';
        }
    }