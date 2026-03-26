export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export const buildPaginatedResult = <T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number,
): PaginatedResult<T> => ({
  items,
  page,
  pageSize,
  total,
});

