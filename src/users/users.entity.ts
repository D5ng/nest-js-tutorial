import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  username: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken?: string
}
