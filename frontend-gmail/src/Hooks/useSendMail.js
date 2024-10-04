import {useCallback} from 'react'
import axios from "axios"
import { EMAIL_END_POINT } from "../utils/endpoints";
import { toast } from "react-hot-toast";
const useSendMails = () => {
    
    const sendMail = useCallback(async(to,subject,generateContent,mailData,setGenerateMail)=>{
        toast.loading("Sending...",{
            position:"top-right"
          });
        try{
            const response = await axios.post(`${EMAIL_END_POINT}/send`, {
                to:to,
                subject:subject,
                generatedContent:generateContent,
                mailContent:mailData,
            },{
               withCredentials: true,
            })
            console.log(response.data.message);
            setGenerateMail("");
            toast.dismiss();
            toast.success(response.data.message);
            return "hogya kaam";
        }catch(error){
            console.error(error);
        }
    },[]);

    return sendMail;
}
export default useSendMails;

