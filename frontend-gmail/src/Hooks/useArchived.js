import { useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { setDelete } from "../Redux/emailSlice";
import { EMAIL_END_POINT } from "../utils/endpoints";

const useArchive = () => {
  const dispatch = useDispatch();

  const ArchiveMail = useCallback(async (id) => {
    toast.loading("Arhiving mail",{
      position:"top-right"
    })
    try {
      const response = await axios.put(`${EMAIL_END_POINT}/archive/${id}`,{}, {
        withCredentials: true
      });
      toast.dismiss();
      toast.success(response.data.message);
      dispatch(setDelete(id));
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error("Failed to Archive mail.");
    }
  }, [dispatch]);

  return ArchiveMail;
};

export default useArchive;