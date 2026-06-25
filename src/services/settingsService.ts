import { Settings } from "../models/Settings";
import { UpsertSettingsInput } from "../validators/settingsValidator";

export async function getSettingsByGroup(group?: string) {
  const filter = group ? { group } : {};
  const items = await Settings.find(filter).sort({ group: 1, key: 1 }).lean();

  const grouped = items.reduce<Record<string, Record<string, unknown>>>(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = {};
      acc[item.group][item.key] = item.value;
      return acc;
    },
    {},
  );

  return group ? grouped[group] || {} : grouped;
}

export async function upsertSettings(input: UpsertSettingsInput) {
  const results = [];

  for (const entry of input.settings) {
    const setting = await Settings.findOneAndUpdate(
      { key: entry.key },
      { key: entry.key, value: entry.value, group: entry.group },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    results.push(setting);
  }

  return results;
}
