import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { Note } from './entities/note.entity';
import { Owner, OwnerDto } from 'src/core/decorators/owner.decorator';
import { ShareNoteDto } from './dto/share-note.dto';

@ApiTags('Notes')
@ApiBearerAuth()
@ApiExtraModels(Note)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Body() createNoteDto: CreateNoteDto, @Owner() owner: OwnerDto) {
    return this.notesService.create(createNoteDto, owner);
  }

  @Post('/:uid/share')
  shareNote(
    @Body() shareNoteDto: ShareNoteDto,
    @Param('uid') uid: string,
    @Owner() owner: OwnerDto,
  ) {
    return this.notesService.shareNote(uid, shareNoteDto, owner);
  }

  @Get()
  findAll(@Owner() owner: OwnerDto) {
    return this.notesService.findAll(owner);
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.notesService.findOne(uid);
  }

  @Put(':uid')
  update(@Param('uid') uid: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(uid, updateNoteDto);
  }

  @Delete(':uid')
  remove(@Param('uid') uid: string) {
    return this.notesService.remove(uid);
  }
}
