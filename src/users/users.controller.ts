import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { Owner, OwnerDto } from '../core/decorators/owner.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@ApiExtraModels(User)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'My Profile' })
  @ApiConsumes('application/json')
  @ApiCreatedResponse({
    description: 'Logged in user details',
    type: User,
  })
  find(@Owner() owner: OwnerDto) {
    return this.usersService.findOne(owner.uid);
  }

  @Get('/getUsers')
  findUser() {
    return this.usersService.find();
  }
}
