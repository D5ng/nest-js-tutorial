import { registerAs } from '@nestjs/config'
import path from 'path'
import { DataSource, DataSourceOptions } from 'typeorm'

const config = {
  type: 'postgres',
  host: `${process.env.DB_HOST || 'localhost'}`,
  port: parseInt(`${process.env.DB_PORT || '5432'}`, 10),
  username: `${process.env.DB_USERNAME || 'test'}`,
  password: `${process.env.DB_PASSWORD || 'test'}`,
  database: `${process.env.DB_DATABASE || 'inflearn'}`,
  entities: [path.join(__dirname, '/../../dist/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '/../../src/migrations/**/*{.ts,.js}')],
  autoLoadEntities: true,
  synchronize: false,
}

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions)
