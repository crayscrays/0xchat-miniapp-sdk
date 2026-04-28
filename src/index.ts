// ─── Agent (server-side) ─────────────────────────────────────────────────────
export { Agent, MessageContext, SlashCommandContext, createAgent } from "./agent";
export type {
  AgentConfig,
  GroupMember,
  WebhookEvent,
  WebhookSender,
  ActionEvent,
  JoinedEvent,
  RemovedEvent,
  CardMessage,
  CardAction,
  CardActionStyle,
  CardActionType,
  CardPaymentAction,
  CardField,
  CardMemberAction,
  AgentEventName,
  AgentEventHandler,
  CommandOption,
  SlashCommandDefinition,
  ResolvedUser,
  SlashCommandPayload,
  SlashCommandEvent,
} from "./types";

// ─── App / Bridge (client-side) ──────────────────────────────────────────────
export { AppBridge, BridgeProvider, createAppBridge } from "./bridge";
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

// ─── Mock (testing / local dev) ──────────────────────────────────────────────
export { MockAppBridge, createMockBridge } from "./mock";
export type { MockBridgeConfig } from "./mock";
