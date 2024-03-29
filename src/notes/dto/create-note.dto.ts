import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Note',
    example: 'Project review meeting scheduled at 05:00pm IST',
  })
  note: string;
}
