import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BlockUserDto } from './dto/block-user.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@CurrentUser('userId') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Put('profile')
  updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  @Get('privacy')
  getPrivacy(@CurrentUser('userId') userId: string) {
    return this.userService.getPrivacy(userId);
  }

  @Put('privacy')
  updatePrivacy(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdatePrivacyDto,
  ) {
    return this.userService.updatePrivacy(userId, dto);
  }

  @Get('home')
  getHome(@CurrentUser('userId') userId: string) {
    return this.userService.getHome(userId);
  }

  @Get('public/:id/posts')
  publicPosts(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Query() q: PaginationQueryDto,
  ) {
    return this.userService.getPublicPosts(userId, id, q.page, q.pageSize);
  }

  @Get('public/:id')
  getPublic(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.userService.getPublicProfile(userId, id);
  }

  @Get('soul-match')
  soulMatch(
    @CurrentUser('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.userService.soulMatch(
      userId,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Post('follow')
  follow(
    @CurrentUser('userId') userId: string,
    @Body() dto: BlockUserDto,
  ) {
    return this.userService.toggleFollow(userId, dto.userId);
  }

  @Get('following')
  following(
    @CurrentUser('userId') userId: string,
    @Query() q: PaginationQueryDto,
  ) {
    return this.userService.followingList(userId, q.page, q.pageSize);
  }

  @Get('followers')
  followers(
    @CurrentUser('userId') userId: string,
    @Query() q: PaginationQueryDto,
  ) {
    return this.userService.followersList(userId, q.page, q.pageSize);
  }

  @Post('location')
  updateLocation(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.userService.updateLocation(userId, dto);
  }

  @Get('nearby')
  nearby(@CurrentUser('userId') userId: string) {
    return this.userService.nearbyUsers(userId);
  }

  @Get('block/list')
  blockList(@CurrentUser('userId') userId: string) {
    return this.userService.blockList(userId);
  }

  @Delete('block/:id')
  unblock(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.userService.unblock(userId, Number(id));
  }

  @Post('block')
  blockUser(
    @CurrentUser('userId') userId: string,
    @Body() dto: BlockUserDto,
  ) {
    return this.userService.blockUser(userId, dto.userId);
  }
}
