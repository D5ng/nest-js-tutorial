import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AccessTokenGuard } from 'src/common/guards/access-token.guard'
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import { AuthService } from './auth.service'
import { SignInDto } from './dto/sign-in.dto'
import { SignUpDto } from './dto/sign-up.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto)
  }

  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto)
  }

  @UseGuards(AccessTokenGuard)
  @Get('signout')
  signOut(@Req() req: RequestWithUser) {
    const userId = req.user['sub']

    if (!userId) {
      throw new UnauthorizedException('접근 권한이 없습니다.')
    }

    return this.authService.signOut(userId)
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshAllTokens(@Req() req: RequestWithUser) {
    const userId = req.user['sub']
    const refreshToken = req.user['refreshToken']
    return this.authService.refreshAllTokens(userId, refreshToken)
  }
}
