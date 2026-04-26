import { createAgent } from "@0xchat/miniapp-sdk";

const agent = createAgent({
  apiKey: process.env.AGENT_API_KEY!,
  webhookSecret: process.env.WEBHOOK_SECRET!,
});

agent.on("message", async (ctx) => {
  await ctx.reply(`Echo: ${ctx.content}`);
});

agent.on("joined", async (ctx) => {
  await ctx.reply("👋 Echo bot here — I'll repeat everything you say.");
});

agent.on("action", async (ctx) => {
  await ctx.reply(`You tapped: ${ctx.raw.action_id}`);
});

agent.listen(3000);
console.log("Echo bot listening on http://localhost:3000");
