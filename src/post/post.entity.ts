import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({
  name: 'posts',
})
export class Post {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string

  @Column({ type: 'text', nullable: false })
  content: string

  @Column({ type: 'int', nullable: false, name: 'author_id' })
  authorId: number
}
