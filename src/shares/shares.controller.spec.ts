import { Test, TestingModule } from '@nestjs/testing';
import { SharesController } from './shares.controller';
import { SharesService } from './shares.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Share } from './entities/share.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  softDelete: jest.fn(),
});

describe('SharesController', () => {
  let controller: SharesController;
  let sharesRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharesController],
      providers: [
        SharesService,
        {
          provide: getRepositoryToken(Share),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    controller = module.get<SharesController>(SharesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
