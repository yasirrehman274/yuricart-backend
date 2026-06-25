"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
async function startServer() {
    await (0, db_1.connectDatabase)();
    const app = (0, app_1.createApp)();
    app.listen(env_1.env.PORT, () => {
        console.log(`Yuricart API running on port ${env_1.env.PORT} (${env_1.env.NODE_ENV})`);
        console.log(`Health: http://localhost:${env_1.env.PORT}/api/v1/health`);
    });
}
startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
