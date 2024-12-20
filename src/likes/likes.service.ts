import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  addLike (userId: number, puzzleId: number) {
    return `${userId}, puzzleId}`
  }
}