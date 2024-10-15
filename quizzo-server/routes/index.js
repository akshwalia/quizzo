var express = require('express');
var router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");
var dotenv = require('dotenv');
dotenv.config();

router.post('/getQuestions', async function (req, res, next) {
  const n = req.body.numQuestions;
  const topic = req.body.topic;
  const difficulty = req.body.difficulty;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Give me ${n} questions based on ${topic}, each with four options, one correct options, and in string format, the format should be such that I can convert it to json directly in node.js using .json function, do not give any extra explanation text, just the questions, optionss and the correct option for each. And if ${topic} doesn't make sense. Just return a json throwing an error. The output should contains fields named options, correct_option, question. Difficulty level should be ${difficulty}.`;

  let result = await model.generateContent(prompt);

  // Remove the first 4 and last 4 characters from the response
  let responseText = await result.response.text();

  // Remove the first 4 and last 4 characters from the response (adjust if necessary)
  let resString = responseText.slice(8, -3);

  try {
    // Parse the result to JSON
    let resJSON = JSON.parse(resString);
    res.json(resJSON); // Send the JSON response
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse JSON' }); 
  }

});

module.exports = router;
