import {useEffect} from "react";
import {useDispatch} from "react-redux";
import axios from "axios"
import { EMAIL_END_POINT } from "../utils/endpoints";
import { setMails, setMail, setLength, setLoading, setCurrentBox, setCurrentIndex } from "../Redux/emailSlice.js";
import { toast } from "react-hot-toast";

const useDraftMails = async() => {
    const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(setLoading(true));
        dispatch(setCurrentBox("drafts"));
        const fetchMails = async()=> {
            try{
                console.log("fetching mails");
                const response = await axios.get(`${EMAIL_END_POINT}/draftMails`,{
                    withCredentials:true,
                });
                toast.success(response.data.message);
                dispatch(setMails(response.data.mails));
                dispatch(setMail(null));
                dispatch(setCurrentIndex(undefined));
                dispatch(setLength({key:"drafts",value:response.data.mails.length}));
                dispatch(setLoading(false));

            }catch(error){
                console.log(error);
            }
        }
        fetchMails();
    },[dispatch]);
}
export default useDraftMails;