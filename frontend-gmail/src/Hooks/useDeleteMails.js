import { useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { setDelete } from "../Redux/emailSlice";
import { EMAIL_END_POINT } from "../utils/endpoints";

export const useDeleteMail = () => {
  const dispatch = useDispatch();

  const deleteMail = useCallback(async (id) => {
    toast.loading("Moving to trash.",{
      position:"top-right"
    })
    try {
      const response = await axios.get(`${EMAIL_END_POINT}/trash/${id}`, {
        withCredentials: true
      });
      toast.dismiss();
      toast.success(response.data.message);
      dispatch(setDelete(id));

    } catch (error) {
      toast.dismiss();
      toast.error(error.response.data.message);
    }
  }, [dispatch]);

  return deleteMail;
};

export const useDeletePermanently = () =>{
  const dispatch = useDispatch();
  const deletePermanently = useCallback(async (id) => {
    toast.loading("Deleting mail",{
      position:"top-right"
    })
    try {
      const response = await axios.get(`${EMAIL_END_POINT}/delete/${id}`, {
        withCredentials: true
      });
      toast.dismiss();
      toast.success(response.data.message);
      dispatch(setDelete(id));
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error("Failed to delete mail.");
    }
  }, [dispatch]);

  return deletePermanently;
}
