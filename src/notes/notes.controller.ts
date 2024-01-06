import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { Note } from './entities/note.entity';
import { Owner, OwnerDto } from '../core/decorators/owner.decorator';
import { ShareNoteDto } from './dto/share-note.dto';
import { GetNotesDto } from './dto/get-notes.dto';

@ApiTags('Notes')
@ApiBearerAuth()
@ApiExtraModels(Note)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNoteDto: CreateNoteDto, @Owner() owner: OwnerDto) {
    return this.notesService.create(createNoteDto, owner);
  }

  @Post('/:uid/share')
  @HttpCode(HttpStatus.OK)
  shareNote(
    @Body() shareNoteDto: ShareNoteDto,
    @Param('uid') uid: string,
    @Owner() owner: OwnerDto,
  ) {
    return this.notesService.shareNote(uid, shareNoteDto, owner);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Owner() owner: OwnerDto) {
    return this.notesService.findAll(owner);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  searchAll(@Owner() owner: OwnerDto, @Query() query: GetNotesDto) {
    return this.notesService.findAll(owner, query.searchKey);
  }

  @Get(':uid')
  @HttpCode(HttpStatus.FOUND)
  findOne(@Param('uid') uid: string) {
    return this.notesService.findOne(uid);
  }

  @Put(':uid')
  @HttpCode(HttpStatus.OK)
  update(@Param('uid') uid: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(uid, updateNoteDto);
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.OK)
  remove(@Param('uid') uid: string) {
    return this.notesService.remove(uid);
  }
}
