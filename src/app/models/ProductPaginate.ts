export interface Image {
    id: string;
    routeFile: string;
    nameEntity: string;
    nameFile: string;
}

export interface Content {
    id: string;
    code: string;
    name: string;
    shortDescription: string;
    cantd: number;
    size: string;
    price: number;
    createdAt: any;
    discount: number;
    category: string;
    rating: number;
    typeGarment: string;
    images: Image[];
}

export interface Sort {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}

export interface Pageable {
    sort: Sort;
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
}

export interface Sort2 {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}

export interface ProductPaginate {
    content: Content[];
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: Sort2;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}