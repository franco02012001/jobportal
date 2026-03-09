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
exports.FormConfigController = void 0;
const common_1 = require("@nestjs/common");
const form_config_service_1 = require("./form-config.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_enum_1 = require("../common/roles.enum");
const JOB_LISTING_KEY = 'job-listing';
let FormConfigController = class FormConfigController {
    constructor(formConfigService) {
        this.formConfigService = formConfigService;
    }
    async getJobListingConfig() {
        return this.formConfigService.getByKey(JOB_LISTING_KEY);
    }
    async upsertJobListingConfig(body) {
        return this.formConfigService.upsertByKey(JOB_LISTING_KEY, body);
    }
};
exports.FormConfigController = FormConfigController;
__decorate([
    (0, common_1.Get)('job-listing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FormConfigController.prototype, "getJobListingConfig", null);
__decorate([
    (0, common_1.Put)('job-listing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FormConfigController.prototype, "upsertJobListingConfig", null);
exports.FormConfigController = FormConfigController = __decorate([
    (0, common_1.Controller)('form-configs'),
    __metadata("design:paramtypes", [form_config_service_1.FormConfigService])
], FormConfigController);
//# sourceMappingURL=form-config.controller.js.map