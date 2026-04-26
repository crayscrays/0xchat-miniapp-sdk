// Shared
export type { GroupMember } from "./shared";

// Agent — server-side (Node.js): receive webhooks, reply to messages, manage group state
export { Agent, MessageContext, createAgent } from "./agent/index";
export type {
  AgentConfig,
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
} from "./agent/index";

// App — client-side (browser): iframe bridge for mini-apps running inside 0xChat
export { AppBridge, BridgeError, createAppBridge } from "./app/index";
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
} from "./app/index";
