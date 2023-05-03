import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const basePromptPrefix = "I've been messaging someone and this is the conversation so far:\n";
const basePromptSuffix = "\nCould you give me some ideas of how to respond and why? Do you have any tips about this situation?";
let basePromptMid = "";
const generateAction = async (req, res) => {
  // Run first prompt
  const adjs = req.body.adjectives;
  if (adjs.length != 0) {
    basePromptMid = "\nI want to be: " + adjs.join(" ");
  }

  // console.log(`API: \n${basePromptPrefix}${req.body.userInput}${basePromptMid}${basePromptSuffix}`)

  const baseCompletion = await openai.createCompletion({
    model: 'gpt-3.5-turbo',
    prompt: `${basePromptPrefix}${req.body.userInput}${basePromptMid}${basePromptSuffix}`,
    temperature: 0.9,
    max_tokens: 300,
  });
  
  const basePromptOutput = baseCompletion.data.choices.pop();

  res.status(200).json({ output: basePromptOutput });
};

export default generateAction;
