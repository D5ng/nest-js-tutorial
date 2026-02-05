import { Body, Controller, Delete, Get, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AccessTokenGuard } from 'src/common/guards/access-token.guard'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import { UpdateUserDto } from './dto/update-user-dto'
import { User } from './users.entity'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    const userId = req.user['sub']

    if (!userId) {
      throw new UnauthorizedException('접근 권한이 없습니다.')
    }

    const { id, name, username } = await this.usersService.findById(userId)

    return {
      id,
      name,
      username,
    }
  }

  @UseGuards(AccessTokenGuard)
  @Put('me')
  async updateUser(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user['sub']

    if (!userId) {
      throw new UnauthorizedException('접근 권한이 없습니다.')
    }

    const user = await this.usersService.update(userId, updateUserDto)

    return this.shieldUserInfo(user)
  }

  @UseGuards(AccessTokenGuard)
  @Delete('me')
  async deleteUser(@Req() req: RequestWithUser) {
    const userId = req.user['sub']

    if (!userId) {
      throw new UnauthorizedException('접근 권한이 없습니다.')
    }

    return this.usersService.remove(userId)
  }

  private shieldUserInfo(user: User) {
    return {
      ...user,
      password: undefined,
      refreshToken: undefined,
    }
  }
}
