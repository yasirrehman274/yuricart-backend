"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertSettingsSchema = exports.settingsQuerySchema = void 0;
const zod_1 = require("zod");
exports.settingsQuerySchema = zod_1.z.object({
    group: zod_1.z.string().optional(),
});
exports.upsertSettingsSchema = zod_1.z.object({
    settings: zod_1.z
        .array(zod_1.z.object({
        key: zod_1.z.string().min(1),
        value: zod_1.z.unknown(),
        group: zod_1.z.string().min(1),
    }))
        .min(1),
});
