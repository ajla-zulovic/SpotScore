export interface NewServiceDto {
    name: string;
    description: string;
    categoryId: number;
    imageFile: File;
    genreId?: number;
    cityId?: number;
    latitude?: number;
    longitude?: number;
    address?: string;
  }
  