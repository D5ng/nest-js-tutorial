import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateUserDto } from './dto/create-user-dto'
import { UpdateUserDto } from './dto/update-user-dto'
import { User } from './users.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = this.userRepository.create(createUserDto)
    return this.userRepository.save(createdUser)
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find()
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } })

    if (!user) {
      throw new NotFoundException(`${id}에 해당하는 사용자를 찾을 수 없습니다.`)
    }

    return user
  }

  async findUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } })

    if (!user) {
      throw new NotFoundException(`${username}에 해당하는 사용자를 찾을 수 없습니다.`)
    }

    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userRepository.update(id, updateUserDto)
    if (updatedUser.affected === 0) {
      throw new NotFoundException(`${id}에 해당하는 사용자를 찾을 수 없습니다.`)
    }

    return this.findById(id)
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`${id}에 해당하는 사용자를 찾을 수 없습니다.`)
    }
  }
}
