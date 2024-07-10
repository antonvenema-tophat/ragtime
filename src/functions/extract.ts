import PDFParser from "pdf2json";

import winkNLP from "wink-nlp";
import winkNLPModel from "wink-eng-lite-web-model";

const nlp = winkNLP(winkNLPModel);

const extract = async (path: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser({});

    let done = false;
    pdfParser.on("pdfParser_dataError", (errData) => {
      if (done) return;
      done = true;
      reject(errData.parserError);
    });
    pdfParser.on("pdfParser_dataReady", async (pdfData) => {
      if (done) return;
      done = true;

      let index = 0;
      const pages = [];
      for (const pdfPage of pdfData.Pages) {
        index++;
        const page = pdfPage.Texts
          .map(pdfText => pdfText.R
            .map(pdfTextRun => pdfTextRun.T)
            .map(decodeURIComponent)
            .join("")
          ).join("")
          .trim()
          .replace(/^[!@#\$%\^&\*\(\)_\+-={}\[\]:";'<>\?,.\/]*/,  "")
          .replace( /[!@#\$%\^&\*\(\)_\+-={}\[\]:";'<>\?,.\/]*$/, "");
        if (page == "") continue;

        const freqTable = nlp.readDoc(page).tokens().out(nlp.its.type, nlp.as.freqTable) as [token: string, freq: number][];
        let wordCount = 0;
        let otherCount = 0;
        for (const [tokenType, tokenCount] of freqTable) {
          if (tokenType == "word") wordCount += tokenCount;
          else otherCount += tokenCount;
        }
        const ratio = otherCount / wordCount;
        if (ratio > 0.75) continue;
        
        pages.push(page);
      }
      
      resolve(pages);
    });
    pdfParser.loadPDF(path);
  });
};

export { extract };
