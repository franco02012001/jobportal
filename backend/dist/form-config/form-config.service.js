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
exports.FormConfigService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const form_config_schema_1 = require("./form-config.schema");
let FormConfigService = class FormConfigService {
    constructor(formConfigModel) {
        this.formConfigModel = formConfigModel;
    }
    async getByKey(key) {
        const existing = await this.formConfigModel.findOne({ key }).lean().exec();
        if (!existing) {
            throw new common_1.NotFoundException(`Form configuration with key "${key}" not found`);
        }
        return existing;
    }
    async upsertByKey(key, dto) {
        const updated = await this.formConfigModel
            .findOneAndUpdate({ key }, {
            key,
            formTitle: dto.formTitle,
            formDescription: dto.formDescription,
            steps: dto.steps ?? [],
        }, {
            new: true,
            upsert: true,
        })
            .lean()
            .exec();
        return updated;
    }
};
exports.FormConfigService = FormConfigService;
exports.FormConfigService = FormConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(form_config_schema_1.FormConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FormConfigService);
//# sourceMappingURL=form-config.service.js.map