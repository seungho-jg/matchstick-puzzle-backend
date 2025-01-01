import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateVarificationToken } from 'src/auth/utils/token-generator';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const verificationToken = generateVarificationToken();

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        verificationToken,
      },
      select: {
        id: true,
        username: true,
        email: true,
        isVerified: true,
        verificationToken: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }});
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id }});
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    })
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id }});
  }
}
