import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { StaffAuthService } from '../../service/auth/staff-auth.service';
import type {
  GoogleSignInDto,
  StaffSignInDto,
  StaffSignUpDto,
} from './staff-auth.dto';

@Controller('staff')
export class StaffAuthController {
  constructor(private readonly staffAuthService: StaffAuthService) {}

  @Post('signup')
  async signUp(@Body() body: StaffSignUpDto) {
    console.log(body);
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

  @Post('google-signin')
  async googleSignIn(@Body() body: GoogleSignInDto) {
    if (!body || !body.credential) {
      throw new BadRequestException('Google credential is required');
    }

    return this.staffAuthService.googleSignIn(body.credential);
  }

  @Post('google-signup')
  async googleSignUp(@Body() body: GoogleSignInDto) {
    if (!body || !body.credential) {
      throw new BadRequestException('Google credential is required');
    }

    return this.staffAuthService.googleSignUp(body.credential);
  }
}
