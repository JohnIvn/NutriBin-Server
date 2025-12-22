import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { StaffAuthService } from '../../service/auth/staff-auth.service';
import type { StaffSignInDto, StaffSignUpDto } from './staff-auth.dto';

@Controller('staff')
export class StaffAuthController {
  constructor(private readonly staffAuthService: StaffAuthService) {}

  @Post('signup')
  async signUp(@Body() body: StaffSignUpDto) {
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    return this.staffAuthService.signUp(body);
  }

  @Post('signin')
  async signIn(@Body() body: StaffSignInDto) {
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    return this.staffAuthService.signIn(body);
  }
}
