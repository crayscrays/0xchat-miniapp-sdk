export type { GroupMember } from "../shared";

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
  user: {
    wallet: string;
    displayName: string;
  };
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
