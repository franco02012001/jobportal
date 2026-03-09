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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_schema_1 = require("./user.schema");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const users_service_1 = require("./users.service");
const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const DOC_MAX_SIZE = 10 * 1024 * 1024;
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    me(user) {
        return user;
    }
    async updateMe(user, dto) {
        const u = user;
        const id = u.id ?? u._id?.toString();
        return this.usersService.updateProfile(id, dto);
    }
    async changePassword(user, dto) {
        const u = user;
        const id = u.id ?? u._id?.toString();
        await this.usersService.changePassword(id, dto.currentPassword, dto.newPassword);
        return { message: 'Password updated' };
    }
    async uploadAvatar(user, file, req) {
        const u = user;
        const id = u.id ?? u._id?.toString();
        const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
        return this.usersService.uploadAvatar(id, file, baseUrl);
    }
    async uploadResume(user, file, req) {
        const u = user;
        const id = u.id ?? u._id?.toString();
        const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
        return this.usersService.uploadResume(id, file, baseUrl);
    }
    async uploadCoverLetter(user, file, req) {
        const u = user;
        const id = u.id ?? u._id?.toString();
        const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
        return this.usersService.uploadCoverLetter(id, file, baseUrl);
    }
    async deleteMe(user) {
        const u = user;
        const id = u.id ?? u._id?.toString();
        await this.usersService.deleteMe(id);
        return { message: 'Account deleted' };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.User]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "me", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.User, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Post)('me/change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.User, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('me/avatar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', { limits: { fileSize: AVATAR_MAX_SIZE } })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)('me/resume'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('resume', { limits: { fileSize: DOC_MAX_SIZE } })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadResume", null);
__decorate([
    (0, common_1.Post)('me/cover-letter'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverLetter', { limits: { fileSize: DOC_MAX_SIZE } })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadCoverLetter", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteMe", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map