import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AccessTokenPayload } from '../auth/token.service.js';
import { PublicUserDto } from './dto/public-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserService } from './user.service.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // antes de :id, senao "me" cairia no ParseUUIDPipe e viraria 400
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<PublicUserDto> {
    return this.userService.updateMe(user.sub, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PublicUserDto> {
    return this.userService.findPublicById(id);
  }
}
