import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;

export class LoginDto {
  @IsNotEmpty()
  @IsEmail(null, { message: 'Please provide valid Email.' })
  @ApiProperty({
    description: 'Email',
    example: 'ibalthaf@gmail.com',
  })
  email: string;

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
  password: string;
}
