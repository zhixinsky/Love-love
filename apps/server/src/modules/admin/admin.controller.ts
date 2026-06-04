import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/public.decorator';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AuditHandleDto } from './dto/audit-handle.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto.username, dto.password);
  }

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('audit/list')
  auditList() {
    return this.adminService.auditList();
  }

  @Post('audit/handle')
  auditHandle(@Body() dto: AuditHandleDto) {
    return this.adminService.auditHandle(dto);
  }

  @Get('user/list')
  userList(@Query() q: PaginationQueryDto, @Query('keyword') keyword?: string) {
    return this.adminService.userList(q.page, q.pageSize, keyword);
  }

  @Post('user/:id/status')
  setUserStatus(
    @Param('id') id: string,
    @Body('status') status: number,
  ) {
    return this.adminService.setUserStatus(id, status);
  }

  @Get('report/list')
  reportList(@Query() q: PaginationQueryDto) {
    return this.adminService.reportList(q.page, q.pageSize);
  }

  @Get('ai/stats')
  aiStats() {
    return this.adminService.aiStats();
  }
}
