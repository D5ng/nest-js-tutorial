import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
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
    const updatedPost = await this.postRepository.update(id, updatePostDto)

    if (updatedPost.affected === 0) {
      throw new NotFoundException(`${id}에 해당하는 게시글을 찾을 수 없습니다.`)
    }

    const post = await this.postRepository.findOne({ where: { id } })
    return post
  }

  async remove(id: number): Promise<void> {
    const result = await this.postRepository.delete(id)

    if (result.affected === 0) {
      throw new NotFoundException(`${id}에 해당하는 게시글을 찾을 수 없습니다.`)
    }
  }
}
