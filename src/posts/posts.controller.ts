import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/auth.guard';
import { PaginationDto } from 'src/pagination/pagination.dto';

@Controller('api/v1/user/posts')
@ApiTags('User-Posts')
@Roles(Role.USER)
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    const { categoryIds, authorId, ...createData } = createPostDto;
    return this.postsService.create({
      ...createData,
      author: {
        connect: { id: authorId },
      },
      categories: {
        create: categoryIds.map((id) => ({
          category: {
            connect: { id },
          },
        })),
      },
    });
  }

  @Get('published')
  findAll(@Query() params: PaginationDto) {
    return this.postsService.findAll({
      page: Number(params?.page),
      limit: Number(params?.limit),
      where: { published: true, deleted: false },
    });
  }

  @Get('drafts')
  findDrafts(@Query() params: PaginationDto) {
    return this.postsService.findAll({
      page: Number(params?.page),
      limit: Number(params?.limit),
      where: { published: false, deleted: false },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne({ id: +id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    const { categoryIds, ...updateData } = updatePostDto;
    return this.postsService.update({
      where: { id: +id },
      data:
        categoryIds?.length > 0
          ? {
              ...updateData,
              categories: {
                deleteMany: {
                  postId: +id,
                },
                createMany: {
                  data: categoryIds.map((categoryId) => ({
                    categoryId: categoryId,
                  })),
                },
              },
            }
          : updateData,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove({ id: +id });
  }
}
