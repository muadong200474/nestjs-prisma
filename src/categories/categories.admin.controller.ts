import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateCagetoryDto } from './dto/create-category.dto';
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginationDto } from 'src/pagination/pagination.dto';

@Controller('api/v1/admin/categories')
@ApiTags('Admin-Categories')
@Roles(Role.ADMIN)
@UseGuards(AuthGuard('jwt'), RoleGuard)
@ApiBearerAuth()
export class CategoriesAdminController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Get()
  async findAll(@Query() params: PaginationDto) {
    return this.categoryService.findAll({
      page: Number(params?.page),
      limit: Number(params?.limit),
      where: {
        deleted: false,
      },
    });
  }

  @Post()
  async create(@Body() data: CreateCagetoryDto) {
    return this.categoryService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
    return this.categoryService.update({
      where: { id: +id },
      data,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoryService.remove({ id: +id });
  }
}
