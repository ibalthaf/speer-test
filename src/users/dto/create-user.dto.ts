import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserGender } from '../enums/gender.enum';
import { Exclude, plainToClass } from 'class-transformer';
import { User } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;

export class CreateUserDto {
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
}
