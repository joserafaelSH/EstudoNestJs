import {
    Body,
    Controller,
    Get,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser, GetUserId } from '../auth/decorator';
import { jwtGuard } from '../auth/guard';
import { EditUserDto } from './dto/edit-user.dto';
import { UserService } from './user.service';

@UseGuards(jwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}
    @Get('me')
    getMe(@GetUser() user: User) {
        return user;
    }

    @Patch()
    editUser(
        @GetUserId('id') userId: number,
        @Body() dto: EditUserDto,
    ) {
        return this.userService.editUser(userId, dto);
    }
}
