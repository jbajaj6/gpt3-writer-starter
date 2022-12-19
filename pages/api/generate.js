import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const basePromptPrefix = "I've been messaging someone and this has been the conversation so far:\n";
const basePromptSuffix = "\nCould you give me a couple ideas of what to say next and why? Do you have any tips about this situation?";
const generateAction = async (req, res) => {
  // Run first prompt
  console.log(`API: \n${basePromptPrefix}${req.body.userInput}${basePromptSuffix}`)

  const baseCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${basePromptPrefix}${req.body.userInput}${basePromptSuffix}`,
    temperature: 0.7,
    max_tokens: 750,
  });
  
  const basePromptOutput = baseCompletion.data.choices.pop();

  res.status(200).json({ output: basePromptOutput });
};

export default generateAction;
