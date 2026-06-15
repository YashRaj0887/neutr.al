import { Controller, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.profilesService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(
    @Request() req: { user: UserDocument },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.update(String(req.user._id), dto);
  }
}
