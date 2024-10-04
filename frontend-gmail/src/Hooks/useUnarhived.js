import { useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { setDelete } from "../Redux/emailSlice";
import { EMAIL_END_POINT } from "../utils/endpoints";

const useUnarchived = () => {
  const dispatch = useDispatch();

  const UnarchiveMail = useCallback(async (id) => {
    toast.loading("Moved to Inbox",{
      position:"top-right"
    })
    try {
      const response = await axios.put(`${EMAIL_END_POINT}/unarchive/${id}`,null, {
        withCredentials: true
      });
      toast.dismiss();
      toast.success(response.data.message);
      dispatch(setDelete(id));
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error("Failed to Unarchive mail.");
    }
  }, [dispatch]);

  return UnarchiveMail;
};

export default useUnarchived;