import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { Role } from '../common/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const plain: any =
      typeof (user as any).toObject === 'function'
        ? (user as any).toObject()
        : (user as any);
    const { password: _pw, ...safeUser } = plain;
    const userId = safeUser.id ?? safeUser._id?.toString();
    return {
      access_token: this.jwtService.sign({
        sub: userId,
        email: safeUser.email,
        role: safeUser.role,
      }),
      user: safeUser,
    };
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const role = dto.role === Role.ADMIN ? Role.EMPLOYEE : (dto.role || Role.EMPLOYEE);
    const created = await this.usersService.create({
      ...dto,
      password: hashed,
      role,
    });
    const plain: any =
      typeof (created as any).toObject === 'function'
        ? (created as any).toObject()
        : (created as any);
    const { password: _pw, ...result } = plain;
    const userId = result.id ?? result._id?.toString();
    return {
      access_token: this.jwtService.sign({
        sub: userId,
        email: result.email,
        role: result.role,
      }),
      user: result,
    };
  }
}
