import { program } from "commander";
import { rag } from "./rag";

program
  .name("ragtime")
  .description("CLI to experiment with retrieval-augmented generation.")
  .option("--embed", "Use embeddings to find relevant material.")
  .option("--pdf <PATH>", "Path to the textbook PDF.", "assets/the-language-of-language.pdf")
  .option("--ragless", "Do not search for relevant material.");

program.parse();

const options = program.opts();

(async () => {
  await rag({
    embed: options.embed ? true : false,
    pdfPath: options.pdf,
    ragless: options.ragless ? true : false,
  })
})();