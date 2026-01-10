import rateLimit from "express-rate-limit";

export function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    console.log(`${formattedTime} [${source}] ${message}`);
}

export const aiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

export const pdfRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: "Too many PDF uploads, please wait a few minutes.",
    standardHeaders: true,
    legacyHeaders: false,
});
