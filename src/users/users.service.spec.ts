import { Test } from '@nestjs/testing';
import { UserService } from './users.service';

describe('UserService', () => {
  let service: UserService;

  // describe 실행 before 훅
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('createAccount');
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
