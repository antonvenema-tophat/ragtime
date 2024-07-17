import { RagOptions } from './models/ragOptions';

import { embed } from './functions/embed';
import { extract } from './functions/extract';
import { generate } from './functions/generate';
import { search } from './functions/search';

import chalk from 'chalk';
import path from 'path';
import readline from "node:readline/promises";

const log = console.log;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const rag = async (o: RagOptions) => {
  let pages = null;
  let pageEmbeddings = null;
  if (!o.ragless) {
    /*
    * Extract pages from a PDF file.
    */
    log();
    log(chalk.green("Extracting textbook content..."));
    pages = await extract(path.join(__dirname, o.pdfPath));

    if (o.embed) {
      /*
       * Create an embedding (vector) for each page.
       */
      log();
      log(chalk.green("Creating page embeddings..."));
      pageEmbeddings = await Promise.all(pages.map(embed));
    }
  }

  while (true) {
    let pageIndex = null;
    if (pages) {
      /*
      * Identify how many pages the user has read. (This should be automated as part of the user state.)
      */
      log();
      let progress = 0;
      while (Number.isNaN(progress) || progress <= 0) {
        progress = parseInt(await rl.question(chalk.blue("How much of the textbook have you read (%)? ")));
      }
      pageIndex = Math.max(1, Math.min(pages.length, Math.ceil(pages.length * progress / 100)));
    }

    /*
     * Get the user query.
     */
    log();
    const userQuery = await rl.question(chalk.blue("What would you like to know? "));

    let relevantContent;
    if (pageEmbeddings && pageIndex) {
      /*
       * Create an embedding (vector) for the user query.
       */
      log();
      log(chalk.green("Creating query embedding..."));
      const userQueryEmbedding = await embed(userQuery);

      /*
       * Identify textbook pages similar to the user query.
       */
      log();
      log(chalk.green("Finding similar pages..."));
      const relevantPage = search(userQueryEmbedding, pageEmbeddings.slice(0, pageIndex));
      if (!relevantPage) {
        log();
        log(chalk.red("Keep reading! We haven't come across an answer just yet."));
        continue;
      }

      /*
       * Use the most relevant page.
       */
      relevantContent = relevantPage;
    } else if (pages && pageIndex) {
      /*
       * Use all pages read so far (naively).
       */
      relevantContent = pages.slice(0, pageIndex).join(" ");
    } else {
      relevantContent = "";
    }

    let stream;
    if (relevantContent) {
      /*
      * Prompt the LLM with the relevant content.
      */
      log();
      log(chalk.green(`Prompting LLM with relevant content (${relevantContent.length} characters)...`));
      stream = await generate(`
Context information is below.
---------------------
${relevantContent}
---------------------
Given the context information and not prior knowledge, answer the query.
Query: ${userQuery}
Answer:`);
    } else {
      /*
      * Prompt the LLM with no relevant content.
      */
      log();
      log(chalk.green(`Prompting LLM with no relevant content...`));
      stream = await generate(`
Query: ${userQuery}
Answer:`);
    }

    /*
     * Write out the LLM answer.
     */
    log();
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta.content;
      if (!content) continue;
      process.stdout.write(chalk.magenta(content));
    }
    process.stdout.write("\n");
  }
};

export { rag, RagOptions };