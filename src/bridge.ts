import type {
  AppBridgeConfig,
  AddBotParams,
  BotDeployment,
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
import { BridgeError } from "./types";

interface PendingHandler {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeout: ReturnType<typeof setTimeout>;
}

export class AppBridge {
  private pending = new Map<string, PendingHandler>();
  private appId: string;
  private timeout: number;
  private boundHandler: (event: MessageEvent) => void;

  constructor(config: AppBridgeConfig & { timeout?: number }) {
    this.appId = config.appId;
    this.timeout = config.timeout || 30000;
    this.boundHandler = this.handleMessage.bind(this);
    window.addEventListener("message", this.boundHandler);
  }

  private handleMessage(event: MessageEvent) {
    const msg = event.data;
    if (!msg || msg.type !== "0xchat-bridge-response") return;
    const handler = this.pending.get(msg.id);
    if (!handler) return;
    clearTimeout(handler.timeout);
    this.pending.delete(msg.id);
    if (msg.error) {
      handler.reject(new BridgeError(msg.error.message, msg.error.code));
    } else {
      handler.resolve(msg.result);
    }
  }

  private request<T>(method: string, params?: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new BridgeError("Request timed out", 408));
      }, this.timeout);
      this.pending.set(id, { resolve, reject, timeout });
      window.parent.postMessage(
        { type: "0xchat-bridge", id, method, params, appId: this.appId },
        "*"
      );
    });
  }

  destroy() {
    window.removeEventListener("message", this.boundHandler);
    for (const [, handler] of this.pending) {
      clearTimeout(handler.timeout);
      handler.reject(new BridgeError("Bridge destroyed", 499));
    }
    this.pending.clear();
  }

  wallet = {
    getAddress: () => this.request<string>("wallet.getAddress"),
    getChainId: () => this.request<number>("wallet.getChainId"),
    getBalance: (params: { token?: string }) => this.request<string>("wallet.getBalance", params),
    sendTransaction: (params: SendTransactionParams) =>
      this.request<string>("wallet.sendTransaction", params),
    signMessage: (params: SignMessageParams) =>
      this.request<string>("wallet.signMessage", params),
    readContract: (params: ReadContractParams) =>
      this.request<any>("wallet.readContract", params),
  };

  user = {
    getProfile: () => this.request<UserProfile>("user.getProfile"),
  };

  contacts = {
    list: () => this.request<Contact[]>("contacts.list"),
  };

  groups = {
    list: () => this.request<GroupSummary[]>("groups.list"),
    getMembers: (groupId: string) =>
      this.request<GroupMember[]>("groups.getMembers", { groupId }),
  };

  chat = {
    shareCard: (params: ShareCardParams) => this.request<void>("chat.shareCard", params),
    shareCardToGroup: (params: ShareCardToGroupParams) =>
      this.request<void>("chat.shareCardToGroup", params),
  };

  bots = {
    addToGroup: (params: AddBotParams) =>
      this.request<{ success: boolean }>("bots.addToGroup", params),
    removeFromGroup: (params: AddBotParams) =>
      this.request<{ success: boolean }>("bots.removeFromGroup", params),
    addToDm: (params: { botHandle: string; peerAddress: string }) =>
      this.request<{ success: boolean }>("bots.addToDm", params),
    listDeployments: (botHandle: string) =>
      this.request<BotDeployment[]>("bots.listDeployments", { botHandle }),
  };

  navigation = {
    openGroup: (groupId: string) => {
      this.request("navigation.openGroup", { groupId }).catch(() => {});
    },
    openDm: (peerAddress: string) => {
      this.request("navigation.openDm", { peerAddress }).catch(() => {});
    },
    openApp: (appSlug: string, params?: Record<string, string>) => {
      this.request("navigation.openApp", { appSlug, params }).catch(() => {});
    },
  };
}

export function createAppBridge(config: AppBridgeConfig & { timeout?: number }): AppBridge {
  return new AppBridge(config);
}
