"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const couponController_1 = require("../../controllers/couponController");
const validate_1 = require("../../middleware/validate");
const couponValidator_1 = require("../../validators/couponValidator");
const router = (0, express_1.Router)();
router.post("/validate", (0, validate_1.validateBody)(couponValidator_1.validateCouponSchema), couponController_1.validatePublicCoupon);
exports.default = router;
