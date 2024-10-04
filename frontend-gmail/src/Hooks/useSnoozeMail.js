import { useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { EMAIL_END_POINT } from "../utils/endpoints";

const useSnoozeMail = () => {

  const snoozeMail = useCallback(async (id,snoozeTime) => {
    toast.loading("Snoozing mail",{
      position:"top-right"
    });
    try {
      const response = await axios.put(`${EMAIL_END_POINT}/snoozeMail`,null, {
        params: {
          id: id,
          snoozeTime: snoozeTime
        },
        withCredentials: true
      });
      toast.dismiss();
      toast.error(response.data.message);
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error("Failed to snooze mail.");
    }
  }, []);

  return snoozeMail;
};

export default useSnoozeMail;
