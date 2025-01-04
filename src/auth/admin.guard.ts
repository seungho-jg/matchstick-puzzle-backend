import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) return false;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === 'ADMIN';
  }
}