import z from "zod";
import dotenv from "dotenv";
import { formatZodError } from "@schema-hub/zod-error-formatter";

const configSchema = z.object({
    // Third party
    AZURE_PERSONAL_ACCESS_TOKEN: z.string(),
    AZURE_ORG_URL: z.string(),
    LLM_BASE_URL: z.string().url(),
    LLM_API_KEY: z.string(),
    REPO_SERVICE_LOCAL_DIR: z.string(),
    // ZPR server
    ZPR_PORT: z.coerce.number(),
});

export type ConfigType = z.infer<typeof configSchema>;

dotenv.config({ quiet: true });

const result = configSchema.safeParse(process.env);
if (result.error) {
    const message = formatZodError(result.error, process.env);
    console.error("Failed to load config values");
    console.error(message);
    process.exit(1);
}

console.log("Successfuly loaded the config");
export const env: ConfigType = result.data;





