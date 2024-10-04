import { useDispatch } from "react-redux";
import { persistor } from "../index";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { resetState } from "../Redux/emailSlice";
import { setLogout } from "../Redux/userSlice";
import axios from "axios";
import { EMAIL_END_POINT } from "../utils/endpoints";
import { toast } from 'react-hot-toast';


const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const logout = useCallback(async () => {
        try {
            const result = await axios.get(`${EMAIL_END_POINT}/logout`, {
                withCredentials: true,
            });
            dispatch(setLogout());
            dispatch(resetState());
            await persistor.purge();
            toast.success(result.data.message);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed. Please try again.");
        }
    }, [navigate, dispatch]);

    return logout;
}
export default useLogout;   
