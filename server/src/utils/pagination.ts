/**
 * Interface de parâmetros de paginação
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Interface de resultado paginado
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Parsear parâmetros de paginação da query string
 */
export const parsePaginationParams = (query: any): { skip: number; take: number; page: number; pageSize: number } => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20)); // Máximo 100 por página
  
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  
  return { skip, take, page, pageSize };
};

/**
 * Criar resultado paginado
 */
export const createPaginatedResult = <T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> => {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
