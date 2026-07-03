import { Transform } from 'class-transformer';
import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

const trimOptionalText = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class CompleteFeedingTaskDto {
  @IsOptional()
  @IsISO8601({ strict: true })
  completedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(trimOptionalText)
  notes?: string;
}
