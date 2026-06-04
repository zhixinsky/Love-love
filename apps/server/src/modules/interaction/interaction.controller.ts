import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ToggleTargetDto } from './dto/toggle-target.dto';
import { InteractionService } from './interaction.service';

@Controller()
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  @Post('like/toggle')
  toggleLike(
    @CurrentUser('userId') userId: string,
    @Body() dto: ToggleTargetDto,
  ) {
    return this.interactionService.toggleLike(userId, dto);
  }

  @Post('collect/toggle')
  toggleCollect(
    @CurrentUser('userId') userId: string,
    @Body() dto: ToggleTargetDto,
  ) {
    return this.interactionService.toggleCollect(userId, dto);
  }

  @Post('comment')
  createComment(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.interactionService.createComment(userId, dto);
  }

  @Get('collect/list')
  collectList(
    @CurrentUser('userId') userId: string,
    @Query() q: PaginationQueryDto,
  ) {
    return this.interactionService.collectList(userId, q.page, q.pageSize);
  }

  @Get('comment/list')
  commentList(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
    @Query() q: PaginationQueryDto,
  ) {
    return this.interactionService.commentList(
      Number(targetType),
      Number(targetId),
      q.page,
      q.pageSize,
    );
  }
}
