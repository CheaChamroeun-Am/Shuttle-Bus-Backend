import rateLimit from "express-rate-limit";
export const rateLimiterUsingThirdParty = rateLimit({
  windowMs: 1 * 1000,
  max: 120,
  message: "You have exceeded the 60 requests in 1 mn limit!",
  standardHeaders: true,
  legacyHeaders: false,
});
