export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

export function parsePagination(query: Record<string, unknown> = {}): PaginationParams {
  const rawPage = Number(query.page);
  const rawPageSize = Number(query.pageSize);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  let pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0 ? rawPageSize : 20;

  if (pageSize > 100) {
    pageSize = 100;
  }

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return { page, pageSize, skip, take };
}

export function buildPaginationMeta(page: number, pageSize: number, total: number): PaginationMeta {
  const safeTotal = Math.max(0, total);
  const totalPages = Math.ceil(safeTotal / pageSize);

  return {
    page,
    pageSize,
    total: safeTotal,
    totalPages,
  };
}
