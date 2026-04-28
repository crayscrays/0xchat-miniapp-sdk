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
export interface MockBridgeConfig extends AppBridgeConfig {
  walletAddress?: string;
  profile?: Partial<UserProfile>;
  contacts?: Contact[];
  groups?: GroupSummary[];
  onCall?: (method: string, params?: any) => void;
}

export class MockAppBridge {
  private cfg: MockBridgeConfig;

  constructor(config: MockBridgeConfig) {
    this.cfg = config;
  }

  private log(method: string, params?: any) {
    console.log(`[MockAppBridge] ${method}`, params ?? "");
    this.cfg.onCall?.(method, params);
  }

  destroy() {
    this.log("destroy");
  }

  wallet = {
    getAddress: async () => {
      this.log("wallet.getAddress");
      return this.cfg.walletAddress ?? "0xf00d000000000000000000000000000000000001";
    },
    getChainId: async () => {
      this.log("wallet.getChainId");
      return 8453;
    },
    getBalance: async (params: { token?: string }) => {
      this.log("wallet.getBalance", params);
      return "100.00";
    },
    sendTransaction: async (params: SendTransactionParams) => {
      this.log("wallet.sendTransaction", params);
      return "0xmocktxhash";
    },
    signMessage: async (params: SignMessageParams) => {
      this.log("wallet.signMessage", params);
      return "0xmocksignature";
    },
    readContract: async (params: ReadContractParams) => {
      this.log("wallet.readContract", params);
      return null;
    },
  };

  user = {
    getProfile: async (): Promise<UserProfile> => {
      this.log("user.getProfile");
      return {
        walletAddress: this.cfg.walletAddress ?? "0xf00d000000000000000000000000000000000001",
        displayName: "dev.eth",
        avatar: "",
        ...this.cfg.profile,
      };
    },
  };

  contacts = {
    list: async (): Promise<Contact[]> => {
      this.log("contacts.list");
      return this.cfg.contacts ?? [];
    },
  };

  groups = {
    list: async (): Promise<GroupSummary[]> => {
      this.log("groups.list");
      return (
        this.cfg.groups ?? [{ id: "mock-group-1", name: "Dev Group", avatar: "", memberCount: 2 }]
      );
    },
    getMembers: async (groupId: string): Promise<GroupMember[]> => {
      this.log("groups.getMembers", { groupId });
      return [
        {
          walletAddress: "0xf00d000000000000000000000000000000000001",
          displayName: "dev.eth",
          avatar: "",
          roles: ["admin"],
        },
        {
          walletAddress: "0xbeef000000000000000000000000000000000002",
          displayName: "alice.eth",
          avatar: "",
          roles: ["member"],
        },
      ];
    },
  };

  chat = {
    shareCard: async (params: ShareCardParams) => {
      this.log("chat.shareCard", params);
    },
    shareCardToGroup: async (params: ShareCardToGroupParams) => {
      this.log("chat.shareCardToGroup", params);
    },
  };

  bots = {
    addToGroup: async (params: AddBotParams) => {
      this.log("bots.addToGroup", params);
      return { success: true };
    },
    removeFromGroup: async (params: AddBotParams) => {
      this.log("bots.removeFromGroup", params);
      return { success: true };
    },
    addToDm: async (params: { botHandle: string; peerAddress: string }) => {
      this.log("bots.addToDm", params);
      return { success: true };
    },
    listDeployments: async (botHandle: string): Promise<BotDeployment[]> => {
      this.log("bots.listDeployments", { botHandle });
      return [];
    },
  };

  navigation = {
    openGroup: (groupId: string) => {
      this.log("navigation.openGroup", { groupId });
    },
    openDm: (peerAddress: string) => {
      this.log("navigation.openDm", { peerAddress });
    },
    openApp: (appSlug: string, params?: Record<string, string>) => {
      this.log("navigation.openApp", { appSlug, params });
    },
  };
}

export function createMockBridge(config: MockBridgeConfig): MockAppBridge {
  return new MockAppBridge(config);
}
