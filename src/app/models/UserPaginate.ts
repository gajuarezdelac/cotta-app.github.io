
    export interface Content {
        names: string;
        surnames: string;
        username: string;
        gender: string;
        dateOfBirth: any;
        numberPhone?: any;
        role: string;
        token: string;
        expireToken?: number;
        profileImageUrl: string;
        joinDate: any;
        authorities: string[];
        location?: any;
        lastLoginDate: any;
        lastLoginDateDisplay: any;
        active: boolean;
        notLocked: boolean;
    }

    export interface Sort {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    }

    export interface Pageable {
        sort: Sort;
        offset: number;
        pageNumber: number;
        pageSize: number;
        unpaged: boolean;
        paged: boolean;
    }

    export interface Sort2 {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    }

    export interface UserPaginate {
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
