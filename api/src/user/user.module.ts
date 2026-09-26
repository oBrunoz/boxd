import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';

@Module({
  // o guard precisa do JwtService, e o AuthModule ja depende daqui: forwardRef
  // quebra o ciclo sem duplicar a configuracao do JWT
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
