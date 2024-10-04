import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({
  path: './.env'
});
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export const gemini = async(req,res)=>{
    const prompt = req.query.prompt;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log(text);
    return res.status(200).json({
      success:true,
      text:text,
    });
}
export const geminiHelper = async(prompt)=>{
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log("GEMINI RESPONSE " + text + "GEMINI RESPONSE ENDS");
    return text;
}