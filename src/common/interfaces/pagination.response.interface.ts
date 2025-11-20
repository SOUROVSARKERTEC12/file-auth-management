export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginationResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
