import * as Joi from 'joi';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestaurantsModule } from './restaurants/restaurants.module';
import { Restaurant } from './restaurants/entities/restaurants.entity';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 앱 전체에서 접근가능하게 설정
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test', // 파일 path 설정
      ignoreEnvFile: process.env.NODE_ENV === 'prod', // depoly 시 환경변수 파일 사용하지 않겠다는 설정
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod'),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
      }), // 환경변수 유효성 검사
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod', // 데이터베이스 모든 모듈 동기화 여부
      logging: true,
      entities: [
        // Restaurant
        User,
      ],
    }),
    // RestaurantsModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    UsersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.ALL,
    });
  }
}
