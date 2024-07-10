import OpenAI from "openai";

const model = "text-embedding-3-large";
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const embed = async (source: string) => {
  const response = await openai.embeddings.create({
    input: source,
    model,
  });
  return { source, value: response.data.map(d => d.embedding)[0], };
};

export { embed };