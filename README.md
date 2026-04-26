# @0xchat/miniapp-sdk

Build agents and mini-apps on [0xChat](https://0xchat.com) — one SDK for both server-side agents and client-side mini-apps.

## Installation

```bash
npm install @0xchat/miniapp-sdk
# or
yarn add @0xchat/miniapp-sdk
# or
pnpm add @0xchat/miniapp-sdk
```

---

## Agent (server-side)

Receive webhook events from 0xChat groups, reply with text or rich cards, and manage persistent group state.

```ts
import { createAgent } from "@0xchat/miniapp-sdk";

const agent = createAgent({
  apiKey: process.env.AGENT_API_KEY!,
  webhookSecret: process.env.WEBHOOK_SECRET!,
});

agent.on("message", async (ctx) => {
  if (ctx.mentioned) {
    await ctx.reply(`Hey ${ctx.sender.displayName}! 👋`);
  }
});

agent.on("joined", async (ctx) => {
  await ctx.reply("Thanks for adding me! Type @agent help to get started.");
});

agent.listen(3000);
// POST /webhook  — receives events from 0xChat
// GET  /health   — health check
```

### Sending a rich card

```ts
agent.on("message", async (ctx) => {
  await ctx.replyCard({
    title: "Your Balance",
    subtitle: "Base network",
    fields: [{ label: "USDC", value: "42.00" }],
    actions: [
      { id: "deposit", label: "Deposit", style: "primary", type: "callback" },
    ],
  });
});
```

### Group state

```ts
agent.on("message", async (ctx) => {
  const count = (await ctx.group.getState("visits")) ?? 0;
  await ctx.group.setState("visits", count + 1);
  await ctx.reply(`This group has had ${count + 1} interactions.`);
});
```

### Events

| Event | When |
|-------|------|
| `message` | A message is sent in a group the agent belongs to |
| `action` | A user taps a card action button |
| `joined` | The agent is added to a group |
| `removed` | The agent is removed from a group |
| `payment_complete` | A payment card action completes |

---

## AppBridge (client-side)

Mini-apps run in a sandboxed `<iframe>` inside 0xChat. `AppBridge` communicates with the host app via `postMessage`.

```ts
import { createAppBridge } from "@0xchat/miniapp-sdk";

const bridge = createAppBridge({ appId: "your-app-id" });

const address = await bridge.wallet.getAddress();
const profile = await bridge.user.getProfile();
```

### Wallet

```ts
await bridge.wallet.getAddress();          // "0xabc…"
await bridge.wallet.getChainId();          // 8453 (Base)
await bridge.wallet.getBalance({ token: "USDC" }); // "42.00"

await bridge.wallet.sendTransaction({
  to: "0xrecipient…",
  token: "USDC",
  amount: "5.00",
});

await bridge.wallet.signMessage({ message: "Hello 0xchat" });

await bridge.wallet.readContract({
  address: "0xcontract…",
  abi: [...],
  functionName: "balanceOf",
  args: [address],
});
```

### User & Social

```ts
await bridge.user.getProfile();    // { walletAddress, displayName, avatar }
await bridge.contacts.list();      // Contact[]
await bridge.groups.list();        // GroupSummary[]
await bridge.groups.getMembers(groupId); // GroupMember[]
```

### Sharing Cards

```ts
await bridge.chat.shareCard({
  to: "0xrecipient…",
  card: { title: "Check this out", subtitle: "From my mini-app" },
});

await bridge.chat.shareCardToGroup({
  groupId: "group-id",
  channelId: "channel-id",
  card: { title: "Group announcement" },
});
```

### Navigation

```ts
bridge.navigation.openGroup("group-id");
bridge.navigation.openDm("0xaddress…");
bridge.navigation.openApp("another-app-slug", { ref: "myapp" });
```

### Cleanup

```ts
bridge.destroy(); // removes event listener and cancels pending requests
```

---

## Local Development / Testing

Use `MockAppBridge` to develop your mini-app without running inside 0xChat:

```ts
import { createMockBridge } from "@0xchat/miniapp-sdk";

const bridge = createMockBridge({
  appId: "dev",
  walletAddress: "0xf00d000000000000000000000000000000000001",
  profile: { displayName: "dev.eth" },
});

// All methods behave identically, logging to console instead of postMessage
const address = await bridge.wallet.getAddress();
```

---

## Error Handling

All bridge methods throw `BridgeError` on failure:

```ts
import { BridgeError } from "@0xchat/miniapp-sdk";

try {
  await bridge.wallet.sendTransaction({ to, token, amount });
} catch (err) {
  if (err instanceof BridgeError) {
    console.error(err.message, err.code);
    // 408 — request timed out
    // 499 — bridge was destroyed
    // 4001 — user rejected the action
  }
}
```

---

## Examples

- [`examples/tip-jar`](./examples/tip-jar) — vanilla JS mini-app that sends USDC tips
- [`examples/echo-bot`](./examples/echo-bot) — Node.js agent that echoes messages

---

## License

MIT
