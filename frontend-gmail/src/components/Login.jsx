import image from "../Assets/image.png"
import image2 from "../Assets/VeniceAI_AQuEc9h.png"
import image3 from "../Assets/VeniceAI_LSSWr7S.png"
import image4 from "../Assets/VeniceAI_qZ4r8Ei.png"
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom"
import { useGoogleLogin } from "@react-oauth/google";
import { EMAIL_END_POINT } from "../utils/endpoints";
import { useDispatch } from "react-redux";
import { setLogin } from "../Redux/userSlice";

export default function LoginPage() {

    const dispatch = useDispatch()
    const navigate = useNavigate();
    const images = [image2, image3, image4];
    const logo = images[Math.floor(Math.random() * 3)];

    const login = useGoogleLogin({
        onSuccess: async(tokenResponse) =>{
            const result = await axios.post(`${EMAIL_END_POINT}/google-auth-code`,{
                code: tokenResponse.code,
            },{
                withCredentials:true,
            });
            dispatch(setLogin(result.data.user));
            if(result.status === 200){
                toast.success('Google login successful.');
                navigate('/');
            }else{
                navigate('/login');
            }
        },
        onError: ()=>{
            toast.error('Google login failed.')
        },
        flow: "auth-code" ,
        scope: 'https://mail.google.com https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        access_type: 'offline',
    });

    return (
        <div className="min-h-screen flex items-center justify-center login relative">
            <div className="logo-container w-[50%] max-w-md bg-primary"><img src={logo} alt="logo" className="logo-container border-[2px] border-primary/10" /></div>
            <div className="p-12 mx-4 w-[50%] max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold text-primary mb-4 flex justify-center gap-4">Kmail <img src={image} alt="logo" className=" h-14" /></h1>
                    <p className="text-xl text-muted-foreground">Sign in to continue</p>
                </div>
                <div className="relative">                
                    <Button
                    onClick={()=>login()}
                    className="w-full py-6 text-lg font-semibold bg-background hover:bg-transparent rounded-none text-foreground border border-primary shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                    <svg className="h-6 w-6 mr-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                </Button>
                </div>

                <div className='terms w-full flex justify-center mt-8 text-gray-500'>
                    <p className='flex items-center text-muted-foreground'>Developed with <span className=' text-red-500 mx-1'>❤️</span> <a className='' href='https://github.com/srivastavas07'>by <span className='font-bold text-foreground'>Kunal Chandra</span></a></p>
                </div>

            </div>
        </div>
    )
}