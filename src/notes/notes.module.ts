import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note } from './entities/note.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteSubscriber } from './entities/note.subscriber';
import { UsersModule } from '../users/users.module';
import { SharesModule } from '../shares/shares.module';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), UsersModule, SharesModule],
  controllers: [NotesController],
  providers: [NotesService, NoteSubscriber],
})
export class NotesModule {}
