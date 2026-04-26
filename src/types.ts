// ─── Shared ──────────────────────────────────────────────────────────────────

export interface GroupMember {
  walletAddress: string;
  displayName: string;
  avatar: string;
  roles: string[];
}

// ─── Agent (server-side) ─────────────────────────────────────────────────────

export interface AgentConfig {
  apiKey: string;
  webhookSecret: string;
  baseUrl?: string;
}

export interface WebhookSender {
  wallet: string;
  displayName: string;
  avatar: string;
}

export interface WebhookEvent {
  event: string;
  group_id: string;
  channel_id: string;
  message_id?: string;
  sender: WebhookSender;
  content: string;
  content_type: string;
  mentioned: boolean;
  timestamp: string;
}

export interface ActionEvent {
  event: "action";
  action_id: string;
  user: { wallet: string; displayName: string };
  group_id: string;
  payload?: any;
}

export interface JoinedEvent {
  event: "joined";
  group_id: string;
  added_by: string;
}

export interface RemovedEvent {
  event: "removed";
  group_id: string;
}

export type CardActionStyle = "primary" | "secondary" | "danger";
export type CardActionType = "callback" | "payment";

export interface CardPaymentAction {
  to: string;
  token: string;
  amount: string;
  memo?: string;
}

export interface CardAction {
  id: string;
  label: string;
  style: CardActionStyle;
  type: CardActionType;
  payload?: any;
  paymentAction?: CardPaymentAction;
}

export interface CardField {
  label: string;
  value: string;
}

export interface CardMemberAction {
  id: string;
  label: string;
  style?: CardActionStyle;
  payload?: any;
}

export interface CardMessage {
  title: string;
  subtitle?: string;
  image?: string;
  fields?: CardField[];
  actions?: CardAction[];
  memberActions?: CardMemberAction[];
}

export type AgentEventName = "message" | "action" | "joined" | "removed" | "payment_complete";
export type AgentEventHandler = (ctx: any) => void | Promise<void>;

// ─── App / Bridge (client-side) ──────────────────────────────────────────────

export interface AppBridgeConfig {
  appId: string;
}

export interface BridgeMessage {
  type: "0xchat-bridge";
  id: string;
  method: string;
  params?: any;
  appId: string;
}

export interface BridgeResponse {
  type: "0xchat-bridge-response";
  id: string;
  result?: any;
  error?: { code: number; message: string };
}

export class BridgeError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = "BridgeError";
    this.code = code;
  }
}

export interface UserProfile {
  walletAddress: string;
  displayName: string;
  avatar: string;
}

export interface Contact {
  walletAddress: string;
  displayName: string;
  avatar: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
}

export interface SendTransactionParams {
  to: string;
  token: string;
  amount: string;
}

export interface SignMessageParams {
  message: string;
}

export interface AppCardField {
  label: string;
  value: string;
}

export interface AppCardAction {
  label: string;
  deeplink?: string;
  url?: string;
}

export interface AppCard {
  title: string;
  subtitle?: string;
  image?: string;
  fields?: AppCardField[];
  action?: AppCardAction;
}

export interface ShareCardParams {
  to: string;
  card: AppCard;
}

export interface ShareCardToGroupParams {
  groupId: string;
  channelId: string;
  card: AppCard;
}

export interface AddBotParams {
  botHandle: string;
  groupId: string;
}

export interface BotDeployment {
  type: "group" | "dm";
  id: string;
  name: string;
  addedAt: string;
}

export interface ReadContractParams {
  address: string;
  abi: any[];
  functionName: string;
  args?: any[];
}
