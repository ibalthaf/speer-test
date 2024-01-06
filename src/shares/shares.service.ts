import { Injectable } from '@nestjs/common';
import { CreateShareDto } from './dto/create-share.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Share } from './entities/share.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(Share)
    private shareRepository: Repository<Share>,
  ) {}

  create(createShareDto: CreateShareDto) {
    return this.shareRepository.save({
      fromUserId: createShareDto.fromUserid,
      toUserId: createShareDto.toUserid,
      noteId: createShareDto.noteid,
    });
  }
}
