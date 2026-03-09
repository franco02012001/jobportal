"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
const roles_enum_1 = require("../common/roles.enum");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
    }
    async login(email, password) {
        const user = await this.validateUser(email, password);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const plain = typeof user.toObject === 'function'
            ? user.toObject()
            : user;
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
    async register(dto) {
        const hashed = await bcrypt.hash(dto.password, 10);
        const role = dto.role === roles_enum_1.Role.ADMIN ? roles_enum_1.Role.EMPLOYEE : (dto.role || roles_enum_1.Role.EMPLOYEE);
        const created = await this.usersService.create({
            ...dto,
            password: hashed,
            role,
        });
        const plain = typeof created.toObject === 'function'
            ? created.toObject()
            : created;
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map