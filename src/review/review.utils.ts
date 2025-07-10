import { env } from "../lib/config";

export const RepoNameIdMap = {
        "DXP": "a39f707b-32ab-4581-9985-bdf78fbba7cd",
        "insights_node_api": "725032b3-6ebe-42c2-ac94-8ffc6bbddeb2",
};

export const RepoNameLocalDirMap = {
    "DXP": env.DXP_LOCAL_DIR,
    "insights_node_api": env.INSIGHTS_NODE_API_LOCAL_DIR,
}
