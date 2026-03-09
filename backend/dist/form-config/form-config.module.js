"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormConfigModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const form_config_schema_1 = require("./form-config.schema");
const form_config_service_1 = require("./form-config.service");
const form_config_controller_1 = require("./form-config.controller");
let FormConfigModule = class FormConfigModule {
};
exports.FormConfigModule = FormConfigModule;
exports.FormConfigModule = FormConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: form_config_schema_1.FormConfig.name, schema: form_config_schema_1.FormConfigSchema }]),
        ],
        controllers: [form_config_controller_1.FormConfigController],
        providers: [form_config_service_1.FormConfigService],
        exports: [form_config_service_1.FormConfigService],
    })
], FormConfigModule);
//# sourceMappingURL=form-config.module.js.map