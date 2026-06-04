import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateWishDto } from './dto/create-wish.dto';
import { WishService } from './wish.service';

@Controller('wish')
export class WishController {
  constructor(private readonly wishService: WishService) {}

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateWishDto) {
    return this.wishService.create(userId, dto);
  }

  @Get('list')
  list(@CurrentUser('userId') userId: string) {
    return this.wishService.list(userId);
  }

  @Post(':id/complete')
  complete(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.wishService.complete(userId, id);
  }
}
