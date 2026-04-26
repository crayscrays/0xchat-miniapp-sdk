import { Agent } from "./agent";
import type { AgentConfig } from "./types";

export { Agent, MessageContext } from "./agent";
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
} from "./types";

export function createAgent(config: AgentConfig): Agent {
  return new Agent(config);
}
