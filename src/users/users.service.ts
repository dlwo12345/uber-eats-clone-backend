import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<string | undefined> {
    try {
      const exists = await this.users.findOne({ email }); // 새로운 유저인지 확인
      if (exists) {
        // 기존 유저라면 error 발생
        return '동일한 email을 가진 유저가 존재합니다.';
      }
      await this.users.save(this.users.create({ email, password, role }));
    } catch (e) {
      console.log('e', e);
      return '계정을 생성할수 없음';
    }

    // 유저 & hash 패스워드 생성
  }
}
