import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreatePostDto) {
    return this.postService.create(userId, dto);
  }

  @Get('list')
  list(
    @CurrentUser('userId') userId: string,
    @Query() q: PaginationQueryDto,
    @Query('tab') tab?: string,
    @Query('city') city?: string,
  ) {
    return this.postService.list(userId, q.page, q.pageSize, tab || 'recommend', city);
  }

  @Get(':id')
  detail(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.postService.detail(userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.postService.remove(userId, id);
  }
}
