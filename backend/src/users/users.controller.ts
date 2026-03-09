import { Body, Controller, Delete, Get, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';

const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DOC_MAX_SIZE = 10 * 1024 * 1024; // 10MB

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return user;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    const u: any = user as any;
    const id = u.id ?? u._id?.toString();
    return this.usersService.updateProfile(id, dto);
  }

  @Post('me/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    const u: any = user as any;
    const id = u.id ?? u._id?.toString();
    await this.usersService.changePassword(id, dto.currentPassword, dto.newPassword);
    return { message: 'Password updated' };
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', { limits: { fileSize: AVATAR_MAX_SIZE } }))
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { protocol: string; get: (n: string) => string },
  ) {
    const u: any = user as any;
    const id = u.id ?? u._id?.toString();
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    return this.usersService.uploadAvatar(id, file, baseUrl);
  }

  @Post('me/resume')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('resume', { limits: { fileSize: DOC_MAX_SIZE } }))
  async uploadResume(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { protocol: string; get: (n: string) => string },
  ) {
    const u: any = user as any;
    const id = u.id ?? u._id?.toString();
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    return this.usersService.uploadResume(id, file, baseUrl);
  }

  @Post('me/cover-letter')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('coverLetter', { limits: { fileSize: DOC_MAX_SIZE } }))
  async uploadCoverLetter(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { protocol: string; get: (n: string) => string },
  ) {
    const u: any = user as any;
    const id = u.id ?? u._id?.toString();
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    return this.usersService.uploadCoverLetter(id, file, baseUrl);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@CurrentUser() user: User) {
    const u: any = user as any;
    const id = u.id ?? u._id?.toString();
    await this.usersService.deleteMe(id);
    return { message: 'Account deleted' };
  }
}
