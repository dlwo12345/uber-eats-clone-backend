import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>; // User타입의 모든 요소를 mock형태로 선언

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;

  // describe 실행 before 훅
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'fegrkrk',
      }); // userRepository의 findOne mock 데이터 설정

      const result = await service.createAccount({
        email: '',
        password: '',
        role: 0,
      });

      expect(result).toMatchObject({
        ok: false,
        error: '동일한 email을 가진 유저가 존재합니다.',
      });
    });
  });

  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
