import { ChatCompletionMessageParam } from "openai/resources";

import OpenAI from "openai";

const model = "gpt-4o";
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const generate = async (prompt: string, system?: string) => {
  const messages: ChatCompletionMessageParam[] = [{ role: "user", content: prompt }];
  if (system) messages.push({ role: "system", content: system });
  const stream = await openai.chat.completions.create({
    model: model,
    messages: messages,
    stream: true,
  });
  return stream;
};

export { generate };