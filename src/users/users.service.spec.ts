import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserGender } from './enums/gender.enum';

// Mock User entity for testing
const mockUser = {
  uid: 'some-unique-id',
  name: 'John Doe',
  email: 'john.doe@example.com',
  gender: 'Male',
  password: 'hashedpassword',
  id: 1,
  created_at: new Date(),
  deleted_at: new Date(),
  updated_at: new Date(),
  shared: [],
  notes: [],
  recievedShares: [],
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  softDelete: jest.fn(),
});

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<MockRepository>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findOne', () => {
    describe('when user with uuid exists', () => {
      it('should return the user object', async () => {
        const userUid = 'some-unique-id';
        usersRepository.findOne.mockResolvedValue(mockUser);
        const result = await usersService.findOne(userUid);
        expect(result).toEqual(mockUser);
        expect(usersRepository.findOne).toHaveBeenCalledWith({
          where: { uid: userUid },
        });
      });
    });

    describe("when user with uuid doesn't exists", () => {
      it('should return null', async () => {
        const userUid = 'nonexistent-uid';

        usersRepository.findOne.mockResolvedValue(null);
        const result = await usersService.findOne(userUid);

        expect(result).toBeNull();
      });
    });
  });

  describe('findOneByEmail', () => {
    it('should find a user by email', async () => {
      const userEmail = 'john.doe@example.com';

      usersRepository.findOne.mockResolvedValue(mockUser);
      const result = await usersService.findOneByEmail(userEmail);

      expect(result).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: userEmail },
      });
    });

    it('should return null if user is not found by email', async () => {
      const userEmail = 'nonexistent@example.com';
      usersRepository.findOne.mockResolvedValue(null);
      await expect(await usersService.findOneByEmail(userEmail)).toBeNull();
    });
  });

  describe('find', () => {
    it('should return an array of users', async () => {
      usersRepository.find.mockResolvedValue([mockUser]);
      const result = await usersService.find();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        gender: UserGender.MALE,
        password: 'hashedpassword',
      };
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.save.mockResolvedValue(mockUser);
      const result = await usersService.create(createUserDto);

      expect(result.uid).toBeDefined();
    });

    it('should throw NotAcceptableException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        gender: UserGender.MALE,
        password: 'hashedpassword',
      };
      usersRepository.findOne.mockResolvedValue(mockUser);
      await expect(usersService.create(createUserDto)).rejects.toThrow(
        NotAcceptableException,
      );
    });
  });
});
