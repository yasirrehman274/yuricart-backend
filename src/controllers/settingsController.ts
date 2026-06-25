import { Request, Response } from "express";
import { getSettingsByGroup, upsertSettings } from "../services/settingsService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { SettingsQuery, UpsertSettingsInput } from "../validators/settingsValidator";

export const getAdminSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await getSettingsByGroup(
    (req.query as unknown as SettingsQuery).group,
  );
  sendSuccess(res, settings);
});

export const patchAdminSettings = asyncHandler(async (req: Request, res: Response) => {
  const results = await upsertSettings(req.body as UpsertSettingsInput);
  sendSuccess(res, results);
});
