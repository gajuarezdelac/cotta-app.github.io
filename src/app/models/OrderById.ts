export interface ProductByOrder {
    id: string;
    code: string;
    productId: string;
    name: string;
    cantd: number;
    size: string;
    price: number;
    discount: number;
    createdAt: any;
}

export interface UserOrder {
    id: string;
    names: string;
    surnames: string;
    username: string;
    gender: string;
    dateOfBirth: any;
    numberPhone?: any;
    role: string;
    profileImageUrl: string;
    joinDate: any;
    authorities: string[];
    location?: any;
    lastLoginDate: any;
    lastLoginDateDisplay: any;
    notLocked: boolean;
    active: boolean;
}

export interface Address {
    id: string;
    userId: string;
    names?: any;
    surnames: string;
    state: string;
    town: string;
    cp: string;
    phone: string;
    emailNotification: string;
    calle: string;
    colonia: string;
    noExterior: string;
    noInterior: string;
    moreInformation: string;
    typeSend: string;
}

export interface OrderById {
    id: string;
    subtotal: number;
    amount: number;
    reference: string;
    statusReference: string;
    methodPayment: string;
    discount: number;
    status: number;
    products: ProductByOrder[];
    user: UserOrder;
    address: Address;
    createdAt: any;
    editAt?: any;
}