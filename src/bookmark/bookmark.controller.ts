import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { GetUserId } from '../auth/decorator';
import { jwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(jwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) {}
    @Post()
    createBookmark(
        @GetUserId('id') userId: number,
        @Body() dto: CreateBookmarkDto,
    ) {
        return this.bookmarkService.createBookmark(
            userId,
            dto,
        );
    }

    @Get()
    getBookmarks(@GetUserId('id') userId: number) {
        return this.bookmarkService.getBookmarks(userId);
    }

    @Get(':id')
    getBookmarksById(
        @GetUserId('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
    ) {
        return this.bookmarkService.getBookmarkById(
            userId,
            bookmarkId,
        );
    }

    @Patch(':id')
    editBookmarkById(
        @GetUserId('id') userId: number,
        @Body() dto: EditBookmarkDto,
        @Param('id', ParseIntPipe) bookmarkId: number,
    ) {
        return this.bookmarkService.editBookmarkById(
            userId,
            dto,
            bookmarkId,
        );
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookmarkById(
        @GetUserId('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
    ) {
        return this.bookmarkService.deleteBookmarkById(
            userId,
            bookmarkId,
        );
    }
}
