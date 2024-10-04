import { useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { setUnread, setRead } from "../Redux/emailSlice";
import { EMAIL_END_POINT } from "../utils/endpoints";

export const useReadMail = () => {
  const dispatch = useDispatch();

  const readMail = useCallback(async (id) => {
    try {
      await axios.put(`${EMAIL_END_POINT}/readMail/${id}`,{}, {
        withCredentials: true
      });
      dispatch(setRead(id));
    } catch (error) {
      console.log(error);
      toast.error("Read failed.");
    }
  }, [dispatch]);

  return readMail;
};

export const useUnreadMail= () => {
  const dispatch = useDispatch();

  const unreadMail = useCallback(async (id) => {
    try {
        toast.success("Marked as unread");
      await axios.put(`${EMAIL_END_POINT}/unreadMail/${id}`, {
        withCredentials: true
      });
      dispatch(setUnread(id));
    } catch (error) {
      console.log(error);
      toast.error("Unread failed.");
    }
  }, [dispatch]);

  return unreadMail;
};