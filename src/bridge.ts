import type {
  AddBotParams,
  AppBridgeConfig,
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
    signMessage: (params: SignMessageParams) => this.request<string>("wallet.signMessage", params),
    readContract: (params: ReadContractParams) => this.request<any>("wallet.readContract", params),
  };

  user = {
    getProfile: () => this.request<UserProfile>("user.getProfile"),
  };

  contacts = {
    list: () => this.request<Contact[]>("contacts.list"),
  };

  groups = {
    list: () => this.request<GroupSummary[]>("groups.list"),
    getMembers: (groupId: string) => this.request<GroupMember[]>("groups.getMembers", { groupId }),
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

// ── BridgeProvider (EIP-1193) ─────────────────────────

type EIP1193Listener = (...args: any[]) => void;

/**
 * EIP-1193 compliant Ethereum provider that routes all RPC calls through the
 * 0xChat bridge. Plug into wagmi, ethers, viem, or any wallet library to
 * auto-connect with the user's embedded wallet when running inside 0xChat.
 */
export class BridgeProvider {
  private bridge: AppBridge;
  private listeners = new Map<string, Set<EIP1193Listener>>();

  constructor(bridge: AppBridge) {
    this.bridge = bridge;
  }

  static isAvailable(): boolean {
    try {
      return window.parent !== window;
    } catch {
      return true;
    }
  }

  async request({ method, params }: { method: string; params?: unknown[] }): Promise<unknown> {
    switch (method) {
      case "eth_accounts":
      case "eth_requestAccounts": {
        const address = await this.bridge.wallet.getAddress();
        return address ? [address] : [];
      }
      case "eth_chainId": {
        const chainId = await this.bridge.wallet.getChainId();
        return "0x" + chainId.toString(16);
      }
      case "net_version": {
        const chainId = await this.bridge.wallet.getChainId();
        return String(chainId);
      }
      case "personal_sign": {
        const raw = (params?.[0] as string) ?? "";
        return this.bridge.wallet.signMessage({ message: decodeHexMessage(raw) });
      }
      case "eth_sign": {
        const raw = (params?.[1] as string) ?? "";
        return this.bridge.wallet.signMessage({ message: decodeHexMessage(raw) });
      }
      case "eth_sendTransaction": {
        const tx = (params?.[0] ?? {}) as { to?: string; value?: string; data?: string };
        if (!tx.to) throw providerError(4001, "Missing 'to' address in transaction");
        if (tx.data && tx.data !== "0x")
          throw providerError(
            4200,
            "Contract call transactions are not supported via the 0xChat bridge"
          );
        const amount = formatWei(tx.value ? BigInt(tx.value) : 0n, 18);
        return this.bridge.wallet.sendTransaction({ to: tx.to, token: "ETH", amount });
      }
      default:
        throw providerError(4200, `Method not supported via 0xChat bridge: ${method}`);
    }
  }

  on(event: string, listener: EIP1193Listener): this {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return this;
  }

  removeListener(event: string, listener: EIP1193Listener): this {
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  addEventListener(event: string, listener: EIP1193Listener): this {
    return this.on(event, listener);
  }

  removeEventListener(event: string, listener: EIP1193Listener): this {
    return this.removeListener(event, listener);
  }
}

function providerError(code: number, message: string): Error & { code: number } {
  const err = new Error(message) as Error & { code: number };
  err.code = code;
  return err;
}

function decodeHexMessage(raw: string): string {
  if (!raw.startsWith("0x")) return raw;
  try {
    const hex = raw.slice(2);
    const bytes = new Uint8Array((hex.match(/.{1,2}/g) ?? []).map((b) => parseInt(b, 16)));
    return new TextDecoder().decode(bytes);
  } catch {
    return raw;
  }
}

function formatWei(wei: bigint, decimals: number): string {
  if (wei === 0n) return "0";
  const divisor = BigInt(10 ** decimals);
  const whole = wei / divisor;
  const fraction = wei % divisor;
  if (fraction === 0n) return whole.toString();
  const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole}.${fractionStr}`;
}
