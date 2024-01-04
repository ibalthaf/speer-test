import { Injectable, NotAcceptableException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (userExists) throw new NotAcceptableException('User already exists!');
    return this.usersRepository.save({
      name: createUserDto.name,
      email: createUserDto.email,
      gender: createUserDto.gender,
      password: createUserDto.password,
    });
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  findOne(uid: string) {
    return this.usersRepository.findOne({ where: { uid } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update({ id }, updateUserDto);
  }

  remove(id: number) {
    return this.usersRepository.softDelete({ id });
  }
}
