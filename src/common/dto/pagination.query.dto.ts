import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  // Optional sorting field
  @IsOptional()
  sortBy?: string;

  // Optional sorting order: ASC or DESC
  @IsOptional()
  order?: 'ASC' | 'DESC';
}
