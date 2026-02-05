import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { User } from 'src/users/users.entity'
import { UsersService } from 'src/users/users.service'
import { SignInDto } from './dto/sign-in.dto'
import { SignUpDto } from './dto/sign-up.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(data: SignUpDto) {
    const existingUser = await this.usersService.findUsername(data.username)

    if (existingUser) {
      throw new BadRequestException('이미 존재하는 사용자입니다.')
    }

    const hashedPassword = await this.hashFn(data.password)
    const newUser = await this.usersService.create({
      ...data,
      password: hashedPassword,
    })

    const tokens = await this.getTokens(newUser)
    await this.updateRefreshToken(newUser.id, tokens.refreshToken)

    return tokens
  }

  async signIn(data: SignInDto) {
    const user = await this.usersService.findUsername(data.username)

    if (!user) {
      throw new BadRequestException('존재하지 않는 사용자입니다.')
    }

    const isPasswordMatched = await argon2.verify(user.password, data.password)
    if (!isPasswordMatched) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.')
    }

    const tokens = await this.getTokens(user)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  async signOut(userId: string) {
    await this.usersService.update(userId, { refreshToken: undefined })
  }

  async refreshAllTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId)

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('refresh token이 존재하지 않습니다.')
    }

    const isRefreshTokenMatched = await argon2.verify(user.refreshToken, refreshToken)
    if (!isRefreshTokenMatched) {
      throw new ForbiddenException('refresh token이 일치하지 않습니다.')
    }

    const tokens = await this.getTokens(user)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  private async hashFn(data: string): Promise<string> {
    return argon2.hash(data)
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashFn(refreshToken)
    await this.usersService.update(userId, { refreshToken: hashedRefreshToken })
  }

  private async getTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id, username: user.username },
        { expiresIn: '15m', secret: this.configService.get<string>('JWT_ACCESS_SECRET')! },
      ),
      this.jwtService.signAsync(
        { sub: user.id, username: user.username },
        { expiresIn: '7d', secret: this.configService.get<string>('JWT_REFRESH_SECRET')! },
      ),
    ])

    return { accessToken, refreshToken }
  }
}
