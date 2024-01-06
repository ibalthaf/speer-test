import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { User } from '../users/entities/user.entity';
import { Note } from './entities/note.entity';
import { UsersService } from '../users/users.service';
import { SharesService } from '../shares/shares.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Share } from '../shares/entities/share.entity';
import { NotAcceptableException, NotFoundException } from '@nestjs/common';
import { QueryBuilder, Repository } from 'typeorm';
import { UpdateNoteDto } from './dto/update-note.dto';

// Mock User entity for testing
const mockUser = {
  id: 1,
  uid: 'user-uid',
  name: 'John Doe',
  email: 'john.doe@example.com',
  gender: 'Male',
  password: 'hashedpassword',
  created_at: new Date(),
  deleted_at: new Date(),
  updated_at: new Date(),
  shared: [],
  notes: [],
  recievedShares: [],
};

// Mock Note entity for testing
const mockNote = {
  id: 1,
  uid: 'note-uid',
  note: 'Test Note',
  userId: 1,
  created_at: new Date(),
  deleted_at: new Date(),
  updated_at: new Date(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  softDelete: jest.fn(),
});

describe('NotesService', () => {
  let notesService: NotesService;
  let notesRepository: MockRepository;
  let usersRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
          useValue: {},
        },
      ],
    }).compile();

    notesRepository = module.get<MockRepository>(getRepositoryToken(Note));
    usersRepository = module.get<MockRepository>(getRepositoryToken(User));
    notesService = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(notesService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const createNoteDto = { note: 'Test Note' };
      const owner = { uid: 'user-uid' };
      usersRepository.findOne.mockReturnValue(mockUser);
      notesRepository.save.mockReturnValue(mockNote);
      const result = await notesService.create(createNoteDto, owner);

      expect(result.note).toEqual(createNoteDto.note);
    });

    it('should throw NotFoundException if user not found', async () => {
      const createNoteDto = { note: 'Test Note' };
      const owner = { uid: 'nonexistent-user' };

      usersRepository.findOne.mockReturnValue(null);

      await expect(notesService.create(createNoteDto, owner)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('shareNote', () => {
    // it('should share a note with another user', async () => {
    //   const noteUid = 'note-uid';
    //   const shareDto = { toUserUid: 'recipient-uid' };
    //   const owner = { uid: 'user-uid' };

    //   notesRepository.save.mockReturnValue(mockNote);
    //   usersRepository.findOne.mockReturnValue(mockUser);

    //   const result = await notesService.shareNote(noteUid, shareDto, owner);

    //   expect(result.message).toContain('successfully');
    // });

    it('should throw NotFoundException if note not found', async () => {
      const noteUid = 'nonexistent-note';
      const shareDto = { toUserUid: 'recipient-uid' };
      const owner = { uid: 'user-uid' };

      notesRepository.save.mockReturnValue(null);
      usersRepository.findOne.mockReturnValue(mockUser);
      usersRepository.findOne.mockReturnValue(mockUser);

      await expect(
        notesService.shareNote(noteUid, shareDto, owner),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if users not found', async () => {
      const noteUid = 'note-uid';
      const shareDto = { toUserUid: 'nonexistent-recipient' };
      const owner = { uid: 'nonexistent-user' };

      notesRepository.save.mockReturnValue(mockNote);
      usersRepository.findOne.mockReturnValue(null);

      await expect(
        notesService.shareNote(noteUid, shareDto, owner),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotAcceptableException if attempting to share with oneself', async () => {
      const noteUid = 'note-uid';
      const shareDto = { toUserUid: 'user-uid' };
      const owner = { uid: 'user-uid' };

      notesRepository.findOne.mockReturnValue(mockNote);
      usersRepository.findOne.mockReturnValue(mockUser);

      await expect(
        notesService.shareNote(noteUid, shareDto, owner),
      ).rejects.toThrow(NotAcceptableException);
    });
  });

  describe('findAll', () => {
    it('should return a list of notes', async () => {
      const owner = { uid: 'user-uid' };

      notesRepository.find.mockReturnValue([mockNote]);
      usersRepository.findOne.mockReturnValue(mockUser);

      const result = await notesService.findAll(owner);

      expect(result).toHaveLength(1);
      expect(result[0].note).toEqual(mockNote.note);
    });
    it('should throw NotFoundException if user not found', async () => {
      const owner = { uid: 'nonexistent-user' };
      usersRepository.findOne.mockReturnValue(null);
      await expect(notesService.findAll(owner)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a note object', async () => {
      const noteUid = 'note-uid';
      notesRepository.findOne.mockReturnValue(mockNote);
      const result = await notesService.findOne(noteUid);
      expect(result.uid).toEqual(noteUid);
    });

    it('should throw NotFoundException if note not found', async () => {
      const noteUid = 'note-uid';
      notesRepository.findOne.mockReturnValue(null);
      await expect(notesService.findOne(noteUid)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateNote: UpdateNoteDto = {
      note: 'update-note',
    };
    it('should return an updated note object', async () => {
      const noteUid = 'note-uid';
      notesRepository.findOne.mockReturnValue(mockNote);
      notesRepository.save.mockReturnValue(updateNote);
      const result = await notesService.update(noteUid, updateNote);
      expect(result.note).toEqual(updateNote.note);
    });

    it('should throw NotFoundException if note not found', async () => {
      const noteUid = 'note-uid';
      notesRepository.findOne.mockReturnValue(null);
      await expect(notesService.update(noteUid, updateNote)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should return affected rows', async () => {
      const noteUid = 'note-uid';
      notesRepository.findOne.mockReturnValue(mockNote);
      notesRepository.softDelete.mockReturnValue({ affected: 1 });
      const result = await notesService.remove(noteUid);
      expect(result.affected).toEqual(1);
    });

    it('should throw NotFoundException if note not found', async () => {
      const noteUid = 'note-uid';
      notesRepository.softDelete.mockReturnValue(null);
      await expect(notesService.remove(noteUid)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
