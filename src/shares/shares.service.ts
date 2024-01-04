import { Injectable } from '@nestjs/common';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Share } from './entities/share.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(Share)
    private notesRepository: Repository<Share>,
  ) {}

  create(createShareDto: CreateShareDto) {
    return 'This action adds a new share';
  }

  findAll() {
    return `This action returns all shares`;
  }

  findOne(id: number) {
    return `This action returns a #${id} share`;
  }

  update(id: number, updateShareDto: UpdateShareDto) {
    return `This action updates a #${id} share`;
  }

  remove(id: number) {
    return `This action removes a #${id} share`;
  }
}
