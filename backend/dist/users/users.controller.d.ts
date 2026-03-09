import { User } from './user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: User): User;
    updateMe(user: User, dto: UpdateProfileDto): Promise<User>;
    changePassword(user: User, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    uploadAvatar(user: User, file: Express.Multer.File, req: {
        protocol: string;
        get: (n: string) => string;
    }): Promise<User>;
    uploadResume(user: User, file: Express.Multer.File, req: {
        protocol: string;
        get: (n: string) => string;
    }): Promise<User>;
    uploadCoverLetter(user: User, file: Express.Multer.File, req: {
        protocol: string;
        get: (n: string) => string;
    }): Promise<User>;
    deleteMe(user: User): Promise<{
        message: string;
    }>;
}
