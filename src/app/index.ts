import { AppBridge } from "./bridge";
import type { AppBridgeConfig } from "./types";

export { AppBridge } from "./bridge";
export { BridgeError } from "./types";
export type {
  AppBridgeConfig,
  BridgeMessage,
  BridgeResponse,
  UserProfile,
  Contact,
  GroupSummary,
  SendTransactionParams,
  SignMessageParams,
  ShareCardParams,
  ShareCardToGroupParams,
  AppCard,
  AppCardField,
  AppCardAction,
  AddBotParams,
  BotDeployment,
  ReadContractParams,
} from "./types";

export function createAppBridge(config: AppBridgeConfig & { timeout?: number }): AppBridge {
  return new AppBridge(config);
}
