import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'sign-token-test'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>; // 타입의 모든 요소를 mock형태로 선언

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  // describe 실행 before 훅
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };
    it('이미 가입된 유저가 있는 케이스 / 실패 되어야함', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'fegrkrk',
      }); // userRepository의 findOne mock 데이터 설정

      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: '동일한 email을 가진 유저가 존재합니다.',
      });
    });

    it('새 사용자 만들기 테스트', async () => {
      usersRepository.findOne.mockResolvedValue(undefined); // 유저 없는 상황 mock 설정
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);

      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({ code: 'code' });

      const result = await service.createAccount(createAccountArgs);
      expect(usersRepository.create).toHaveBeenCalledTimes(1); // create 호출 횟수 1회로 지정
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs); // 해당 인자가 전달되었는지 비교
      expect(usersRepository.save).toHaveBeenCalledTimes(1); // save 호출 횟수 1회로 지정
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs); // 해당 인자가 전달되었는지 비교
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationsRepository.save).toHaveBeenCalledTimes(1); // save 호출 횟수 1회로 지정
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('예외 상황 / 실패 되어야함', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: '계정을 생성할수 없음' });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'test@email.com',
      password: 'test',
    };

    it('사용자가 없는 경우 / 실패해야함', async () => {
      usersRepository.findOne.mockResolvedValue(null); // 유저가 존재하지 않는것으로 resolved 설정
      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: false,
        error: '회원을 찾을수 없습니다',
      });
    });

    it('비밀번호가 틀린 경우 / 실패해야함', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)), // checkPassword resolve값 false로 설정
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: '패스워드가 다릅니다',
      });
    });

    it('비밀번호가 일치하는 경우 / 토큰 반환해야함', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)), // checkPassword resolve값 false로 설정
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'sign-token-test' });
    });

    it('예외 상황 / 실패해야함 ', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: '로그인을 실패했습니다.' });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('기존 사용자를 찾는다', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('사용자를 찾지 못한경우 / 실패', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: '유저를 찾을수 없습니다.' });
    });
  });

  describe('editProfile', () => {
    it('이메일을 찾는다', async () => {
      const oldUser = {
        email: 'test@old.com',
        verified: true,
      };

      const editProfileArgs = {
        userId: 1,
        input: { email: 'test@old.com' },
      };

      const newVerification = {
        code: 'code',
      };

      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );

      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification,
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });
    it('패스워드 변경', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'new.password' },
      };
      usersRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: true });
    });
    it('예외 발생시 / 실패해야함', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: 'test' });
      expect(result).toEqual({ ok: false, error: '업데이트 할 수 없습니다.' });
    });
  });

  describe('verifyEmail', () => {
    it('검증 통과', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };
      verificationsRepository.findOne.mockResolvedValue(mockedVerification);

      const result = await service.verifyEmail('');

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({
        verified: true,
      });
      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );
      expect(result).toEqual({ ok: true });
    });

    it('검증 실패시 / 실패해야함', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({
        ok: false,
        error: 'Verification을 찾을 수 없습니다.',
      });
    });
    it('예외 발생시 / 실패해야함', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Verification을 에러발생' });
    });
  });
});
