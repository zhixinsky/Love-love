import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: { sub: string; role?: string }) {
    if (payload.role === 'admin') {
      return { userId: payload.sub, role: 'admin', isAdmin: true };
    }
    const user = await this.authService.validateUser(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { userId: user.id, user, isAdmin: false };
  }
}
