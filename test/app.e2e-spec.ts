import {
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app/app.module';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import {
    CreateBookmarkDto,
    EditBookmarkDto,
} from 'src/bookmark/dto';

const dto: AuthDto = {
    email: 'teste@teste.com',
    password: 'Teste@123',
};

jest.setTimeout(30000);

describe('App e2e', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
            }),
        );

        await app.init();
        prisma = app.get(PrismaService);
        await app.listen(3333);
        await prisma.cleanDb();
        pactum.request.setBaseUrl('http://localhost:3333/');
    });

    afterAll(async () => {
        await prisma.cleanDb();
        app.close();
    });

    describe('Auth', () => {
        describe('SignUp', () => {
            it('should throw if password length < 8', () => {
                return pactum
                    .spec()
                    .post('auth/signup')
                    .withBody({
                        email: dto.email,
                        password: 'T1a@',
                    })
                    .expectStatus(400);
            });
            it('should throw if password weak', () => {
                return pactum
                    .spec()
                    .post('auth/signup')
                    .withBody({
                        email: dto.email,
                        password: 'teste',
                    })
                    .expectStatus(400);
            });
            it('should throw if email empty', () => {
                return pactum
                    .spec()
                    .post('auth/signup')
                    .withBody({ password: dto.password })
                    .expectStatus(400);
            });
            it('should throw if password empty', () => {
                return pactum
                    .spec()
                    .post('auth/signup')
                    .withBody({ email: dto.email })
                    .expectStatus(400);
            });
            it('should throw if email is envalid', () => {
                return pactum
                    .spec()
                    .post('auth/signup')
                    .withBody({
                        email: 'dto.email',
                        password: '123123',
                    })
                    .expectStatus(400);
            });
            it('should throw if no body provided', () => {
                return pactum
                    .spec()
                    .post('auth/signup')
                    .withBody({})
                    .expectStatus(400);
            });
            it('should sign up', () => {
                return pactum
                    .spec()
                    .post('auth/signup')
                    .withBody(dto)
                    .expectStatus(201);
            });
        });

        describe('SignIn', () => {
            it('should throw if password length < 8', () => {
                return pactum
                    .spec()
                    .post('auth/signup')
                    .withBody({
                        email: dto.email,
                        password: 'T1a@',
                    })
                    .expectStatus(400);
            });
            it('should throw if email empty', () => {
                return pactum
                    .spec()
                    .post('auth/signin')
                    .withBody({ password: dto.password })
                    .expectStatus(400);
            });
            it('should throw if password empty', () => {
                return pactum
                    .spec()
                    .post('auth/signin')
                    .withBody({ email: dto.email })
                    .expectStatus(400);
            });
            it('should throw if email is envalid', () => {
                return pactum
                    .spec()
                    .post('auth/signin')
                    .withBody({
                        email: 'dto.email',
                        password: '123123',
                    })
                    .expectStatus(400);
            });
            it('should throw if no body provided', () => {
                return pactum
                    .spec()
                    .post('auth/signin')
                    .withBody({})
                    .expectStatus(400);
            });
            it('should throw if the password is incorrect', () => {
                return pactum
                    .spec()
                    .post('auth/signin')
                    .withBody({
                        email: dto.email,
                        password: 'Teste@1234567',
                    })
                    .expectStatus(403);
            });
            it('should sign in', () => {
                return pactum
                    .spec()
                    .post('auth/signin')
                    .withBody(dto)
                    .expectStatus(200)
                    .stores('userAt', 'acess_token');
            });
        });
    });

    describe('User', () => {
        describe('Get me', () => {
            it('should get current user', () => {
                return pactum
                    .spec()
                    .get('users/me')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(200);
            });
        });

        describe('Edit user', () => {
            it('should edit user', () => {
                const dto: EditUserDto = {
                    firstName: 'Teste',
                    email: 'teste@teste.com',
                };
                return pactum
                    .spec()
                    .patch('users')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(dto.firstName)
                    .expectBodyContains(dto.email);
            });
        });
    });

    describe('Bookmark', () => {
        describe('Get empty bookmark', () => {
            it('Should get bookmarks', () => {
                return pactum
                    .spec()
                    .get('bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })

                    .expectStatus(200)
                    .expectBody([]);
            });
        });

        describe('Create bookmark', () => {
            it('Should create bookmarks', () => {
                const dto: CreateBookmarkDto = {
                    title: 'Teste',
                    link: 'etesrasdawadawsdaw',
                };
                return pactum
                    .spec()
                    .post('bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(201)

                    .stores('bookmarkId', 'id');
            });
        });

        describe('Get bookmark', () => {
            it('Should get bookmarks', () => {
                return pactum
                    .spec()
                    .get('bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })

                    .expectStatus(200)
                    .expectJsonLength(1);
            });
        });

        describe('Get bookmark by id', () => {
            it('Should get bookmarks by id', () => {
                return pactum
                    .spec()
                    .get('bookmarks/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })

                    .expectStatus(200)
                    .expectBodyContains('$S{bookmarkId}');
            });
        });

        describe('Edit bookmark by id', () => {
            it('Should edit bookmarks by id', () => {
                const dto: EditBookmarkDto = {
                    description: 'Testasdasdasdsae',
                };
                return pactum
                    .spec()
                    .patch('bookmarks/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(dto.description);
            });
        });

        describe('Delete bookmark by id', () => {
            it('Should delete bookmarks by id', () => {
                const dto: EditBookmarkDto = {
                    description: 'Testasdasdasdsae',
                };
                return pactum
                    .spec()
                    .delete('bookmarks/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })
                    .expectStatus(204);
            });

            it('Should get empty bookmarks', () => {
                return pactum
                    .spec()
                    .get('bookmarks')
                    .withHeaders({
                        Authorization: 'Bearer $S{userAt}',
                    })

                    .expectStatus(200)
                    .expectJsonLength(0);
            });
        });
    });
});
