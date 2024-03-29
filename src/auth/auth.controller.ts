import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signUp.dto';
import { Public } from '../core/decorators/public.decorator';
import { Owner, OwnerDto } from '../core/decorators/owner.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @Public()
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/signup')
  @HttpCode(HttpStatus.OK)
  @Public()
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  logout(@Owner() owner: OwnerDto) {
    return this.authService.logout(owner);
  }
}
