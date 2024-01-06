import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { SignUpDto } from './dto/signUp.dto';
import { JwtPayload } from './dto/jwt.payload';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  softDelete: jest.fn(),
});

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

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useClass: MockUserService },
        { provide: JwtService, useClass: MockJwtService },
        { provide: CACHE_MANAGER, useClass: MockCacheManager },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('userService should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('jwtService should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  describe('Auth [/api/auth]', () => {
    describe('/login', () => {
      it.todo('[Login] should return user object and access-token');
      it.todo('[Login] should throw UnauthorizedException');
    });
    describe('/signup', () => {
      it.todo('[Signup] should return user object and access-token');
      it.todo('[Signup] should throw NotAcceptableException');
    });
    describe('/logout', () => {
      it.todo('[Signup] should return success');
      it.todo('[Signup] should throw UnauthorizedException');
    });
  });
});
