import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../../src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/users/entities/user.entity';
import { Note } from '../../src/notes/entities/note.entity';
import { Share } from '../../src/shares/entities/share.entity';
import * as request from 'supertest';
import { SignUpDto } from '../../src//auth/dto/signUp.dto';
import { UserGender } from '../../src//users/enums/gender.enum';
import { AppModule } from '../../src/app.module';
import { LoginDto } from 'src/auth/dto/login.dto';
import { CreateNoteDto } from 'src/notes/dto/create-note.dto';
import { ShareNoteDto } from 'src/notes/dto/share-note.dto';
import { UpdateNoteDto } from 'src/notes/dto/update-note.dto';

describe('[Feature] API-Speer - /api', () => {
  let app: INestApplication;
  let httpServer: HttpServer;
  let accessToken: string;
  let randomUser: User;
  let currUser: User;
  let note: Note;

  const signupData: SignUpDto = {
    email: `test${Math.floor(Math.random() * 90000)}@gmail.com`,
    gender: UserGender.MALE,
    name: 'Althaf',
    password: 'Asd@123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'admin',
          database: 'e2e-test-db',
          entities: [User, Note, Share],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    httpServer = app.getHttpServer();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth [/api/auth]', () => {
    describe('Signup [POST /signup]', () => {
      it('should create a user', () => {
        return request(httpServer)
          .post('/api/auth/signup')
          .send(signupData as SignUpDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body).toHaveProperty('access_token');
            expect(body.access_token).toBeDefined();
            expect(body.user).toBeDefined();
            accessToken = body.access_token;
            currUser = body.user;
          });
      });

      it('should throw NotAcceptableException error for user already exists', () => {
        return request(httpServer)
          .post('/api/auth/signup')
          .send(signupData as SignUpDto)
          .expect(HttpStatus.NOT_ACCEPTABLE);
      });
    });

    describe('Login [POST /login]', () => {
      it('should login and return access-token', () => {
        return request(httpServer)
          .post('/api/auth/login')
          .send({
            email: signupData.email,
            password: signupData.password,
          } as LoginDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body).toHaveProperty('access_token');
            expect(body.access_token).toBeDefined();
            accessToken = body.access_token;
          });
      });

      it('throw UnauthorizedException exception for incorect username or password', () => {
        return request(httpServer)
          .post('/api/auth/login')
          .send({
            email: 'incorect@gmail.com',
            password: signupData.password,
          } as LoginDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    // describe('Logout [POST /logout]', () => {
    //   it('should logout user and blackList the token', () => {
    //     return request(httpServer)
    //       .post('/api/auth/logout')
    //       .set('Authorization', `Bearer ${accessToken}`)
    //       .expect(HttpStatus.OK);
    //   });

    //   it('should throw UNAUTHORIZED error for invalid token', () => {
    //     return request(httpServer)
    //       .post('/api/auth/logout')
    //       .set('Authorization', `Bearer ${accessToken}`)
    //       .expect(HttpStatus.UNAUTHORIZED)
    //       .then(({ body }) => {
    //         accessToken = '';
    //       });
    //   });
    // });
  });

  describe('Users [/api/users]', () => {
    it('should returm user profile', () => {
      return request(httpServer)
        .get('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(({ body }) => {
          expect(body.uid).toBeDefined();
        });
    });

    it('should returm users array', () => {
      return request(httpServer)
        .get('/api/users/getUsers')
        .set('Authorization', `Bearer ${accessToken}`)
        .then(({ body }) => {
          expect(body).toBeDefined();
          expect(body[0]).toBeDefined();
          const users = body.filter((item) => item.email !== signupData.email);
          randomUser = users[Math.floor(Math.random() * body.length)];
        });
    });
  });

  describe('Notes [/api/notes]', () => {
    const noteData: CreateNoteDto = {
      note: 'New note11',
    };

    describe('[Create]', () => {
      it('should return note object after creating', () => {
        return request(httpServer)
          .post('/api/notes')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(noteData)
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            expect(body).toBeDefined();
            expect(body.uid).toBeDefined();
            note = body;
          });
      });
    });

    describe('[Share]', () => {
      it('should share note with a user', () => {
        const shareDto: ShareNoteDto = {
          toUserUid: randomUser.uid,
        };
        return request(httpServer)
          .post(`/api/notes/${note.uid}/share`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(shareDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body.message).toContain('successfully');
          });
      });

      it('should throw an NotFoundException for invalid noteUid', () => {
        const shareDto: ShareNoteDto = {
          toUserUid: randomUser.uid,
        };
        return request(httpServer)
          .post(`/api/notes/invalid-uid/share`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(shareDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should throw an NotFoundException for invalid toUserUid', () => {
        const shareDto: ShareNoteDto = {
          toUserUid: 'invalid-uid',
        };
        return request(httpServer)
          .post(`/api/notes/invalid-uid/share`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(shareDto)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should throw an NotAcceotableException for sharing with self', () => {
        const shareDto: ShareNoteDto = {
          toUserUid: currUser.uid,
        };
        return request(httpServer)
          .post(`/api/notes/${note.uid}/share`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(shareDto)
          .expect(HttpStatus.NOT_ACCEPTABLE);
      });
    });

    describe('[Get]', () => {
      it('should return notes array', () => {
        return request(httpServer)
          .get('/api/notes/')
          .set('Authorization', `Bearer ${accessToken}`)
          .then(({ body }) => {
            expect(body).toBeDefined();
            expect(body[0]).toBeDefined();
          });
      });

      it('should return searched notes array', () => {
        return request(httpServer)
          .get('/api/notes?searchKey=11')
          .set('Authorization', `Bearer ${accessToken}`)
          .then(({ body }) => {
            expect(body).toBeDefined();
            expect(body[0]).toBeDefined();
          });
      });
    });

    describe('[Get /:uid]', () => {
      it('should return note object', () => {
        return request(httpServer)
          .get(`/api/notes/${note.uid}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .then(({ body }) => {
            expect(body).toBeDefined();
            expect(body.uid).toBeDefined();
          });
      });

      it('should throw NotFoundException for invalid uid', () => {
        return request(httpServer)
          .get(`/api/notes/invalid-uid`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });

    describe('[Update /:uid]', () => {
      const updateData: UpdateNoteDto = {
        note: 'note updated',
      };
      it('should return updated note object', () => {
        return request(httpServer)
          .put(`/api/notes/${note.uid}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateData)
          .then(({ body }) => {
            expect(body).toBeDefined();
            expect(body.note).toEqual(updateData.note);
          });
      });

      it('should throw NotFoundException for invalid uid', () => {
        return request(httpServer)
          .put(`/api/notes/invalid-uid`)
          .send(updateData)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });

    describe('[Delete /:uid]', () => {
      it('should return updated note object', () => {
        return request(httpServer)
          .delete(`/api/notes/${note.uid}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .then(({ body }) => {
            expect(body).toBeDefined();
            expect(body.affected).toEqual(1);
          });
      });

      it('should throw NotFoundException for invalid uid', () => {
        return request(httpServer)
          .put(`/api/notes/invalid-uid`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe('Logout [POST /logout]', () => {
    it('should logout user and blackList the token', () => {
      return request(httpServer)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);
    });

    it('should throw UNAUTHORIZED error for invalid token', () => {
      return request(httpServer)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .then(({ body }) => {
          accessToken = '';
        });
    });
  });
});
