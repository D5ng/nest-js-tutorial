import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DatabaseError } from 'pg'
import { QueryFailedError, Repository } from 'typeorm'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { Post } from './post.entity'

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}
  async findAll(): Promise<Post[]> {
    return this.postRepository.find()
  }

  async findOne(id: number): Promise<Post | null> {
    return this.postRepository.findOne({ where: { id } })
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    try {
      const post = this.postRepository.create(createPostDto)
      const savedPost = await this.postRepository.save(post)
      return savedPost
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError instanceof DatabaseError) {
        if (error.driverError.code === '23505') {
          throw new ConflictException('해당 제목과 작성자 ID로 이미 게시글이 존재합니다.')
        }
      }

      throw error
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post | null> {
    await this.postRepository.update(id, updatePostDto)
    return this.postRepository.findOne({ where: { id } })
  }

  async remove(id: number): Promise<void> {
    await this.postRepository.delete(id)
  }
}
