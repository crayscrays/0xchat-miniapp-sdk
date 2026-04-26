// ─── Agent (server-side: receive webhooks, reply to messages, manage group state) ─
export { Agent, MessageContext, createAgent } from "./agent";
export type {
  AgentConfig,
  AgentEventHandler,
  AgentEventName,
  ActionEvent,
  CardAction,
  CardActionStyle,
  CardActionType,
  CardField,
  CardMemberAction,
  CardMessage,
  CardPaymentAction,
  JoinedEvent,
  RemovedEvent,
  WebhookEvent,
  WebhookSender,
} from "./types";

// ─── App / Bridge (client-side: iframe bridge for mini-apps running in 0xChat) ─
export { AppBridge, createAppBridge } from "./bridge";
export { MockAppBridge, createMockBridge } from "./mock";
export type { MockBridgeConfig } from "./mock";
export { BridgeError } from "./types";
export type {
  AddBotParams,
  AppBridgeConfig,
  AppCard,
  AppCardAction,
  AppCardField,
  BotDeployment,
  BridgeMessage,
  BridgeResponse,
  Contact,
  GroupMember,
  GroupSummary,
  ReadContractParams,
  SendTransactionParams,
  ShareCardParams,
  ShareCardToGroupParams,
  SignMessageParams,
  UserProfile,
} from "./types";
