import { Mastra } from "@mastra/core";

import { trainingAssistant } from "./agents/training-assistant";

export const mastra = new Mastra({
  agents: { trainingAssistant },
});

export { trainingAssistant };
