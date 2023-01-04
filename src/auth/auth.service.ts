import {
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private configService: ConfigService,
    ) {}

    async signup(dto: AuthDto) {
        const hash = await argon.hash(dto.password);

        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
            });
            return this.signToken(user.id, user.email);
        } catch (error) {
            if (
                error instanceof
                PrismaClientKnownRequestError
            ) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException(
                        'User already exists',
                    );
                }
            }
        }
    }

    async signin(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!user) {
            throw new ForbiddenException(
                'Invalid credentials',
            );
        }

        const pwMatches = await argon.verify(
            user.hash,
            dto.password,
        );

        if (!pwMatches) {
            throw new ForbiddenException(
                'Invalid credentials',
            );
        }

        return this.signToken(user.id, user.email);
    }

    async signToken(
        userId: number,
        email: string,
    ): Promise<{ acess_token: string }> {
        const payload = {
            sub: userId,
            email,
        };

        const acess_token = await this.jwt.signAsync(
            payload,
            {
                expiresIn: '5m',
                secret: this.configService.get(
                    'JWT_SECRET',
                ),
            },
        );

        return { acess_token };
    }
}
