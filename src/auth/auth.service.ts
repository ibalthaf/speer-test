import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signUp.dto';
import { UsersService } from 'src/users/users.service';
import { compareHash } from 'src/core/core.utils';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt.payload';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user)
      throw new UnauthorizedException('Incorrect username or password!');
    const isMatch = compareHash(loginDto.password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('Incorrect username or password!');
    const { access_token, refresh_token } = await this.createJwtToken(user);
    return { user, access_token, refresh_token };
  }

  async createJwtToken(payload: JwtPayload) {
    return {
      access_token: await this.jwtService.signAsync(
        {
          sub: payload.uid,
          uid: payload.uid,
          email: payload.email,
          name: payload.name,
        },
        { expiresIn: '1d' },
      ),
      refresh_token: await this.jwtService.signAsync(
        {
          sub: payload.uid,
          uid: payload.uid,
          email: payload.email,
          name: payload.name,
        },
        { expiresIn: '30d' },
      ),
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const user = await this.userService.create(signUpDto);
    const { access_token, refresh_token } = await this.createJwtToken(user);
    return { user, access_token, refresh_token };
  }

  // logout() {
  //   return `This action removes a #${id} auth`;
  // }
}
