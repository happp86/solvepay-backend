import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
