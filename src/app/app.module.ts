import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { BookmarkModule } from '../bookmark/bookmark.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        AuthModule,
        UserModule,
        BookmarkModule,
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
