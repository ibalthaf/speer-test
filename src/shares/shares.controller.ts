import { Controller } from '@nestjs/common';
import { SharesService } from './shares.service';

// @ApiTags('Shares')
// @ApiBearerAuth()
// @ApiExtraModels(Share)
@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  // @Post()
  // create(@Body() createShareDto: CreateShareDto) {
  //   return this.sharesService.create(createShareDto);
  // }

  // @Get()
  // findAll() {
  //   return this.sharesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.sharesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateShareDto: UpdateShareDto) {
  //   return this.sharesService.update(+id, updateShareDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.sharesService.remove(+id);
  // }
}
