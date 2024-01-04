import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ShareNoteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User uid notes to be shared with',
    example: '35be5190-ab07-11ee-897b-0fc87cacb8e1',
  })
  toUserUid: string;
}
