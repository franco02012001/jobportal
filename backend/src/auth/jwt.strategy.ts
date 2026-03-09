import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'job-board-secret-key-change-in-production',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    const plain: any =
      typeof (user as any).toObject === 'function'
        ? (user as any).toObject()
        : (user as any);
    const { password: _pw, ...result } = plain;
    const id = result.id ?? result._id?.toString() ?? payload.sub;
    return { ...result, id };
  }
}
