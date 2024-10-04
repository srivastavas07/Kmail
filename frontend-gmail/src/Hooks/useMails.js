import {useEffect} from "react";
import {useDispatch} from "react-redux";
import axios from "axios"
import { EMAIL_END_POINT } from "../utils/endpoints";
import { setMails, setLength, setLoading, setCurrentBox, setCurrentIndex, setMail } from "../Redux/emailSlice.js";
import { toast } from "react-hot-toast";

const useMails = async() => {
    const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(setLoading(true));
        dispatch(setCurrentBox("inbox"));
        const fetchMails = async()=> {
            try{
                console.log("fetching mails");
                const response = await axios.get(`${EMAIL_END_POINT}/allEmails`,{
                    withCredentials:true,
                });
                toast.success(response.data.message);
                dispatch(setMails(response.data.mails));
                dispatch(setMail(null));
                dispatch(setCurrentIndex(undefined));

                // dispatch(setMail(response.data.mails[0]));
                // if you want the first message to be displayed by default.

                dispatch(setLength({key:"inbox",value:response.data.mails.length}));
                dispatch(setLoading(false));

            }catch(error){
                console.log(error);
            }
        }
        fetchMails();
    },[dispatch]);
}
export default useMails;