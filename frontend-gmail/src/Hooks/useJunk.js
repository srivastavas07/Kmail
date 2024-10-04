import { useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { setDelete } from "../Redux/emailSlice";
import { EMAIL_END_POINT } from "../utils/endpoints";

const useJunk = () => {
  const dispatch = useDispatch();

  const JunkMail = useCallback(async (id) => {
    toast.loading("Moving mail to spam.",{
      position:"top-right"
    })
    try {
      const response = await axios.put(`${EMAIL_END_POINT}/junk/${id}`,{}, {
        withCredentials: true
      });
      toast.dismiss();
      toast.success(response.data.message);
      dispatch(setDelete(id));
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error("Failed to move mail.");
    }
  }, [dispatch]);

  return JunkMail;
};

export default useJunk;