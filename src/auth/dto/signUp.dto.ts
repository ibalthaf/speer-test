import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Exclude, plainToClass } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserGender } from 'src/users/enums/gender.enum';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;

export class SignUpDto {
  @IsString()
  @MinLength(2, { message: 'Name must have atleast 2 characters.' })
  @IsNotEmpty()
  @ApiProperty({
    description: 'First Name',
    example: 'Ross',
  })
  name: string;

  @IsNotEmpty()
  @IsEmail(null, { message: 'Please provide valid Email.' })
  @ApiProperty({
    description: 'Email',
    example: 'ibalthaf@gmail.com',
  })
  email: string;

  @IsString()
  @IsEnum(UserGender)
  @ApiProperty({
    enum: UserGender,
    description: 'Gender',
    example: UserGender.MALE,
  })
  gender: UserGender;

  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message: `Password must contain Minimum 8 and maximum 20 characters, 
    at least one uppercase letter, 
    one lowercase letter, 
    one number and 
    one special character`,
  })
  @ApiProperty({
    description: 'Password',
    example: 'Asd123@',
  })
  @Exclude()
  password: string;

  @Exclude()
  id: number;
}
