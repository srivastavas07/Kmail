import { useCallback } from "react";
import axios from "axios";

import { EMAIL_END_POINT } from "../utils/endpoints";

export const useGemini = () => {

  const geminiResult = useCallback(async (prompt) => {
    try{
        const result = await axios.get(`${EMAIL_END_POINT}/gemini`, {
          params: {
            prompt: prompt,
          },
          withCredentials: true,
        });
        return result.data.text;
      }catch(error){
        console.log(error);
      }
  }, []);

  return geminiResult;
};
