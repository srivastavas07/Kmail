import { useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { setDelete } from "../Redux/emailSlice";
import { EMAIL_END_POINT } from "../utils/endpoints";

const useMarkImportant = () => {
  const dispatch = useDispatch();

  const ImportantMail = useCallback(async (id) => {
    toast.loading("Moving mail to Important.",{
      position:"top-right"
    })
    try {
      const response = await axios.put(`${EMAIL_END_POINT}/important/${id}`,{}, {
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

  return ImportantMail;
};

export default useMarkImportant;