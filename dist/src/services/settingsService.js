"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsByGroup = getSettingsByGroup;
exports.upsertSettings = upsertSettings;
const Settings_1 = require("../models/Settings");
async function getSettingsByGroup(group) {
    const filter = group ? { group } : {};
    const items = await Settings_1.Settings.find(filter).sort({ group: 1, key: 1 }).lean();
    const grouped = items.reduce((acc, item) => {
        if (!acc[item.group])
            acc[item.group] = {};
        acc[item.group][item.key] = item.value;
        return acc;
    }, {});
    return group ? grouped[group] || {} : grouped;
}
async function upsertSettings(input) {
    const results = [];
    for (const entry of input.settings) {
        const setting = await Settings_1.Settings.findOneAndUpdate({ key: entry.key }, { key: entry.key, value: entry.value, group: entry.group }, { upsert: true, new: true, runValidators: true }).lean();
        results.push(setting);
    }
    return results;
}
