import crypto from "crypto";
import express, { Request, Response } from "express";
import type {
  AgentConfig,
  AgentEventHandler,
  AgentEventName,
  CardMessage,
  GroupMember,
  WebhookEvent,
} from "./types";

const DEFAULT_BASE_URL = "https://api.0xchat.com";

class ApiClient {
  constructor(
    private apiKey: string,
    private baseUrl: string
  ) {}

  private async fetch(path: string, init: RequestInit = {}): Promise<any> {
    const res = await globalThis.fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...(init.headers || {}),
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Agent API ${init.method || "GET"} ${path} failed: ${res.status} ${body}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  sendMessage(groupId: string, channelId: string, content: string) {
    return this.fetch("/api/agent/send", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, channel_id: channelId, content, content_type: "text" }),
    });
  }

  sendCard(groupId: string, channelId: string, card: CardMessage) {
    return this.fetch("/api/agent/send", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, channel_id: channelId, content: JSON.stringify(card), content_type: "app_card" }),
    });
  }

  getGroupMembers(groupId: string): Promise<GroupMember[]> {
    return this.fetch(`/api/agent/groups/${encodeURIComponent(groupId)}/members`);
  }

  getState(groupId: string, key: string) {
    return this.fetch(`/api/agent/groups/${encodeURIComponent(groupId)}/state/${encodeURIComponent(key)}`);
  }

  setState(groupId: string, key: string, value: any) {
    return this.fetch(`/api/agent/groups/${encodeURIComponent(groupId)}/state/${encodeURIComponent(key)}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  }
}

export class MessageContext {
  public sender: WebhookEvent["sender"];
  public content: string;
  public contentType: string;
  public mentioned: boolean;
  public groupId: string;
  public channelId: string;
  public messageId?: string;
  public timestamp: string;
  public event: string;
  public raw: any;

  constructor(
    private api: ApiClient,
    event: WebhookEvent | any
  ) {
    this.raw = event;
    this.event = event.event;
    this.groupId = event.group_id;
    this.channelId = event.channel_id;
    this.messageId = event.message_id;
    this.sender = event.sender;
    this.content = event.content;
    this.contentType = event.content_type;
    this.mentioned = event.mentioned;
    this.timestamp = event.timestamp;
  }

  reply(content: string) {
    return this.api.sendMessage(this.groupId, this.channelId, content);
  }

  replyCard(card: CardMessage) {
    return this.api.sendCard(this.groupId, this.channelId, card);
  }

  group = {
    getMembers: () => this.api.getGroupMembers(this.groupId),
    getState: (key: string) => this.api.getState(this.groupId, key),
    setState: (key: string, value: any) => this.api.setState(this.groupId, key, value),
  };
}

export class Agent {
  private handlers = new Map<AgentEventName, AgentEventHandler[]>();
  private api: ApiClient;
  private webhookSecret?: string;

  constructor(config: AgentConfig) {
    this.api = new ApiClient(config.apiKey, config.baseUrl || DEFAULT_BASE_URL);
    this.webhookSecret = config.webhookSecret;
  }

  on(event: AgentEventName, handler: AgentEventHandler): this {
    const list = this.handlers.get(event) || [];
    list.push(handler);
    this.handlers.set(event, list);
    return this;
  }

  private verifySignature(rawBody: Buffer | string, signature: string | undefined): boolean {
    if (!this.webhookSecret) return true; // skip verification when no secret configured
    if (!signature) return false;
    const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
    const expected = crypto.createHmac("sha256", this.webhookSecret).update(body).digest("hex");
    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }

  private async dispatch(event: AgentEventName, ctx: any) {
    const list = this.handlers.get(event);
    if (!list || list.length === 0) return;
    for (const handler of list) {
      try {
        await handler(ctx);
      } catch (err) {
        console.error(`[miniapp-sdk] handler for "${event}" threw:`, err);
      }
    }
  }

  listen(port: number): ReturnType<ReturnType<typeof express>["listen"]> {
    const app = express();

    app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({ status: "ok" });
    });

    app.post(
      "/webhook",
      express.raw({ type: "application/json" }),
      async (req: Request, res: Response) => {
        const signature =
          (req.headers["x-webhook-signature"] as string | undefined) ||
          (req.headers["X-Webhook-Signature"] as unknown as string | undefined);

        const rawBody: Buffer = (
          req.body instanceof Buffer
            ? req.body
            : Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body || {}))
        ) as Buffer;

        if (!this.verifySignature(rawBody, signature)) {
          res.status(401).json({ error: "Invalid signature" });
          return;
        }

        let payload: any;
        try {
          payload = JSON.parse(rawBody.toString("utf8"));
        } catch {
          res.status(400).json({ error: "Invalid JSON" });
          return;
        }

        const eventName: AgentEventName = payload.event;
        const ctx = new MessageContext(this.api, payload);

        res.status(200).json({ ok: true });
        this.dispatch(eventName, ctx).catch((err) =>
          console.error(`[miniapp-sdk] dispatch error:`, err)
        );
      }
    );

    return app.listen(port);
  }
}

export function createAgent(config: AgentConfig): Agent {
  return new Agent(config);
}
