import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { ResponseSanitizeInterceptor } from 'src/core/interceptors/responseSanitize.interceptor';
import { Public } from 'src/core/decorators/public.decorator';
import { Owner, OwnerDto } from 'src/core/decorators/owner.decorator';

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
}
