import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signUp.dto';
import { JwtPayload } from './dto/jwt.payload';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import * as coreUtils from '../core/core.utils';
import { UserGender } from '../users/enums/gender.enum';

// Mock UserService
class MockUserService {
  users: User[] = [];
  findOneByEmail(email: string) {
    // Mock implementation
    const filteredUsers = this.users.filter((user) => user.email == email);
    return Promise.resolve(filteredUsers);
  }

  create(signUpDto: SignUpDto) {
    // Mock implementation
    const user = {
      id: Math.floor(Math.random() * 99999),
      email: signUpDto.email,
      password: signUpDto.password,
    } as User;
    this.users.push(user);
    return Promise.resolve(user);
  }
}

// Mock JwtService
class MockJwtService {
  signAsync(payload: JwtPayload, options?: any) {
    // Mock implementation
    return 'token';
  }
}

// Mock CacheManager
class MockCacheManager {
  cache = new Map();
  set(key: string, value: any, ttl: number) {
    // Mock implementation
    this.cache.set(key, value);
  }

  get(key: string) {
    // Mock implementation
    return this.cache.get(key);
  }
}

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;
  const mockUser: User = {
    email: 'test@example.com',
    password: 'hashedpassword',
    id: 1,
    gender: UserGender.MALE,
    name: '',
    uid: '',
    created_at: new Date(),
    deleted_at: new Date(),
    updated_at: new Date(),
    shared: [],
    notes: [],
    recievedShares: [],
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useClass: MockUserService },
        { provide: JwtService, useClass: MockJwtService },
        { provide: CACHE_MANAGER, useClass: MockCacheManager },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid user', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);

      const loginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'invalid',
      };

      await expect(authService.login(loginDto)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      jest
        .spyOn(userService, 'findOneByEmail')
        .mockResolvedValue(Promise.resolve(mockUser));
      jest.spyOn(coreUtils, 'compareHash').mockResolvedValue(false);

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'incorrectpassword',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user and access token for valid credentials', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(coreUtils, 'compareHash').mockResolvedValue(true);
      jest
        .spyOn(authService, 'createJwtToken')
        .mockResolvedValue({ access_token: 'mockAccessToken' });

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'correctpassword',
      };

      const result = await authService.login(loginDto);

      expect(result.user).toEqual(mockUser);
      expect(result.access_token).toEqual('mockAccessToken');
    });
  });

  describe('createJwtToken', () => {
    it('should create JWT token with correct payload', async () => {
      const mockPayload: JwtPayload = {
        uid: '123',
        email: 'test@example.com',
        name: 'Test User',
      };
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mockAccessToken');

      const result = await authService.createJwtToken(mockPayload);

      expect(result.access_token).toEqual('mockAccessToken');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining(mockPayload),
        expect.any(Object),
      );
    });
  });

  describe('addToBlacklist', () => {
    it('should add token to blacklist', async () => {
      // jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);
      jest
        .spyOn(authService['cacheManager'], 'set')
        .mockResolvedValue(undefined);
      await authService.addToBlacklist('tokenId', 3600); // 3600 seconds = 1 hour

      expect(authService['cacheManager'].set).toHaveBeenCalledWith(
        'tokenId',
        true,
        3600,
      );
    });
  });

  describe('isBlacklisted', () => {
    it('should return true for blacklisted token', async () => {
      jest.spyOn(authService['cacheManager'], 'get').mockResolvedValue(true);

      const result = await authService.isBlacklisted('tokenId');

      expect(result).toBe(true);
      expect(authService['cacheManager'].get).toHaveBeenCalledWith('tokenId');
    });

    it('should return false for non-blacklisted token', async () => {
      jest
        .spyOn(authService['cacheManager'], 'get')
        .mockResolvedValue(undefined);

      const result = await authService.isBlacklisted('tokenId');

      expect(result).toBe(false);
      expect(authService['cacheManager'].get).toHaveBeenCalledWith('tokenId');
    });
  });

  describe('signUp', () => {
    it('should create user and return user and access token', async () => {
      const mockSignUpDto = {
        email: 'test@example.com',
        password: 'password',
        gender: UserGender.MALE,
        name: 'Test',
      };
      jest.spyOn(userService, 'create').mockResolvedValue(mockUser);
      jest
        .spyOn(authService, 'createJwtToken')
        .mockResolvedValue({ access_token: 'mockAccessToken' });

      const result = await authService.signUp(mockSignUpDto);

      expect(result.user.email).toEqual('test@example.com');
      expect(result.access_token).toEqual('mockAccessToken');
    });
  });

  describe('logout', () => {
    it('should add token to blacklist', async () => {
      jest.spyOn(authService, 'addToBlacklist').mockResolvedValue(undefined);

      const ownerDto = {
        sessionId: 'tokenId',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }; // 3600 seconds = 1 hour

      await authService.logout(ownerDto);

      expect(authService.addToBlacklist).toHaveBeenCalledWith('tokenId', 3600);
    });
  });
});
