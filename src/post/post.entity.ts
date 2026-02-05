import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({
  name: 'posts',
})
@Index('IDX_POST_TITLE', ['title'])
@Index('IDX_POST_AUTHOR_ID', ['authorId'])
@Index('IDX_POST_TITLE_AUTHOR_ID', ['title', 'authorId'], { unique: true })
export class Post {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string

  @Column({ type: 'text', nullable: false })
  content: string

  @Column({ type: 'int', nullable: false, name: 'author_id' })
  authorId: number

  @CreateDateColumn({ type: 'timestamp', nullable: false, name: 'created_at' })
  createdAt: Date
}
