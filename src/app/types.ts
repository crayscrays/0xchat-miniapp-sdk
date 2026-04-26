export type { GroupMember } from "../shared";

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
  error?: {
    code: number;
    message: string;
  };
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
