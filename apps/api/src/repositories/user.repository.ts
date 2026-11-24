import { prisma } from "../config/prisma";
import { User, Prisma } from "@prisma/client";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findById(id: string): Promise<(User & { restaurant: { id: string; name: string } | null }) | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateLanguage(id: string, language: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { language },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new UserRepository();
