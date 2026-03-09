import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<import("../users/user.schema").User | null>;
    login(email: string, password: string): Promise<{
        access_token: string;
        user: any;
    }>;
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: any;
    }>;
}
