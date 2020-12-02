import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 앱 전체에서 접근가능하게 설정
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test', // 파일 path 설정
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'hong',
      password: '12345',
      database: 'uber-eats',
      synchronize: true, // 데이터베이스 모든 모듈 동기화 여부
      logging: true,
    }),
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
