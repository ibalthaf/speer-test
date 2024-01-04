import { Injectable, NotAcceptableException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { Repository } from 'typeorm';
import { OwnerDto } from 'src/core/decorators/owner.decorator';
import { UsersService } from 'src/users/users.service';
import { ShareNoteDto } from './dto/share-note.dto';
import { SharesService } from 'src/shares/shares.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    private userService: UsersService,
    private shareService: SharesService,
  ) {}

  async create(createNoteDto: CreateNoteDto, owner: OwnerDto) {
    const user = await this.userService.findOne(owner.uid);
    if (!user)
      throw new NotAcceptableException('oops! The request user not found!');
    return this.notesRepository.save({
      note: createNoteDto.note,
      userId: user.id,
    });
  }

  async shareNote(noteUid: string, shareDto: ShareNoteDto, owner: OwnerDto) {
    const [note, toUser, fromUser] = await Promise.all([
      this.notesRepository.findOne({
        where: { uid: noteUid },
      }),
      this.userService.findOne(shareDto.toUserUid),
      this.userService.findOne(owner.uid),
    ]);

    if (!note)
      throw new NotAcceptableException('oops! The request note not found!');
    if (!toUser || !fromUser)
      throw new NotAcceptableException('oops! The user not found!');
    if (note.userId === toUser.id)
      throw new NotAcceptableException(
        'oops! You cannot share your notes with youself!',
      );

    await this.shareService.create({
      fromUserid: fromUser.id,
      toUserid: toUser.id,
      noteid: note.id,
    });

    return { message: `Note shared with ${toUser.name} successfully.` };
  }

  async findAll(owner: OwnerDto) {
    const user = await this.userService.findOne(owner.uid);
    if (!user)
      throw new NotAcceptableException('oops! The request user not found!');
    return this.notesRepository.find({ where: { userId: user.id } });
  }

  findOne(uid: string) {
    return this.notesRepository.findOne({ where: { uid } });
  }

  async update(uid: string, updateNoteDto: UpdateNoteDto) {
    const noteData = await this.notesRepository.findOne({ where: { uid } });
    if (!noteData)
      throw new NotAcceptableException('oops! The request note not found!');
    noteData.note = updateNoteDto.note;
    return this.notesRepository.save(noteData);
  }

  remove(uid: string) {
    return this.notesRepository.softDelete({ uid });
  }
}
