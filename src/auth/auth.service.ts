import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signUp.dto';
import { UsersService } from 'src/users/users.service';
import { compareHash, uuid } from 'src/core/core.utils';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt.payload';
import { Cache } from 'cache-manager';
import { OwnerDto } from 'src/core/decorators/owner.decorator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user)
      throw new UnauthorizedException('Incorrect username or password!');
    const isMatch = compareHash(loginDto.password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('Incorrect username or password!');
    const { access_token } = await this.createJwtToken(user);
    return { user, access_token };
  }

  async createJwtToken(payload: JwtPayload) {
    return {
      access_token: await this.jwtService.signAsync(
        {
          sessionId: uuid(),
          uid: payload.uid,
          email: payload.email,
          name: payload.name,
        },
        { expiresIn: '1d' },
      ),
    };
  }

  async addToBlacklist(tokenId: string, expiresIn: number): Promise<void> {
    // expiresIn is the expiration time of the JWT token in seconds
    await this.cacheManager.set(tokenId, true, expiresIn);
  }

  async isBlacklisted(tokenId: string): Promise<boolean> {
    const blacklisted = await this.cacheManager.get(tokenId);
    return blacklisted !== undefined && blacklisted === true;
  }

  async signUp(signUpDto: SignUpDto) {
    const user = await this.userService.create(signUpDto);
    const { access_token } = await this.createJwtToken(user);
    return { user, access_token };
  }

  async logout(owner: OwnerDto) {
    const tokenId = owner.sessionId;
    const expiresIn = owner.exp - Math.floor(Date.now() / 1000);
    await this.addToBlacklist(tokenId, expiresIn);
    // Perform other logout logic...
  }
}
