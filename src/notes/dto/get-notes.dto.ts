import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetNotesDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  searchKey?: string;
}
