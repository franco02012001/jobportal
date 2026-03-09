import { Role } from '../../common/roles.enum';
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    role?: Role;
    companyName?: string;
}
