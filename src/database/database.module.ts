// src/database/database.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        connectorPackage: 'mysql2',
        driver: require('mysql2'),
      }),
    }),
  ],
})
// Implement OnModuleInit
export class DatabaseModule implements OnModuleInit {
  // Inject the TypeORM DataSource object
  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    // Check if the DataSource is initialized and connected
    if (this.dataSource.isInitialized) {
      console.log('✅ Database connected successfully!');
      console.log(
        `📡 TypeORM using database: ${this.dataSource.options.database}`,
      );
    } else {
      console.error('❌ Database connection failed!');
    }
  }
}