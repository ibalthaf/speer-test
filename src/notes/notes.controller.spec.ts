import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { SharesService } from '../shares/shares.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { User } from '../users/entities/user.entity';
import { Share } from '../shares/entities/share.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  softDelete: jest.fn(),
});

describe('NotesController', () => {
  let controller: NotesController;
  let usersService: UsersService;
  let sharesService: SharesService;
  let notesRepository: MockRepository;
  let usersRepository: MockRepository;
  let shareRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        NotesService,
        UsersService,
        SharesService,
        {
          provide: getRepositoryToken(Note),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Share),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    notesRepository = module.get<MockRepository>(getRepositoryToken(Note));
    usersRepository = module.get<MockRepository>(getRepositoryToken(User));
    shareRepository = module.get<MockRepository>(getRepositoryToken(Share));
    controller = module.get<NotesController>(NotesController);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('notesRepository should be defined', () => {
    expect(notesRepository).toBeDefined();
  });

  it('usersRepository should be defined', () => {
    expect(usersRepository).toBeDefined();
  });

  it('shareRepository should be defined', () => {
    expect(shareRepository).toBeDefined();
  });
});
