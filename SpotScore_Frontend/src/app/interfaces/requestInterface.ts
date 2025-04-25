export interface RequestModel {
    requestId: number;
    userId: number;
    username: string;
    profilePhotoUrl: string;
    serviceName: string;
    categoryId: number;
    categoryName: string;
    description: string;
    imageUrl: string;
    status: string;
    formattedDate: string;
    dateCreated: string;
  }
  
  export interface PaginatedRequests {
    totalRequests: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    data: RequestModel[];
  }
  