import { z } from "zod";

export const settingsQuerySchema = z.object({
  group: z.string().optional(),
});

export const upsertSettingsSchema = z.object({
  settings: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.unknown(),
        group: z.string().min(1),
      }),
    )
    .min(1),
});

export type SettingsQuery = z.infer<typeof settingsQuerySchema>;
export type UpsertSettingsInput = z.infer<typeof upsertSettingsSchema>;
