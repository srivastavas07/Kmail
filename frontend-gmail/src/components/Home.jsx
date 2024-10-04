import axios from "axios";
import Mark from "mark.js";
import MailDisplay from "./MailDisplay";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Navigation } from "./NavBar";
import { Button } from "./ui/button";
import { LogOut, MoreVertical, Search } from "lucide-react";
import { Palette } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Separator } from "./ui/separator";
import { TooltipProvider } from "./ui/tooltip";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "../Context /ThemeContext";
import { EMAIL_END_POINT } from "../utils/endpoints";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { setMails, setMail, setLoading, setLength, setCurrentIndex } from "../Redux/emailSlice.js";
import { Inbox, File, Send, ArchiveX, Trash2, Archive, Star } from "lucide-react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "./ui/dropdown-menu";
import useLogout from "../Hooks/useLogOut";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const Logout = useLogout();
  const { toggleTheme } = useTheme();
  const { mail, lengths, currentBox } = useSelector(store => store.emails);
  const { user } = useSelector(store => store.user);

  useEffect(() => {
    if(!user){
      navigate('/login');
    }
  });
  
  const [searchValue, setSearch] = useState("");
  const BoxCapital = currentBox.charAt(0).toUpperCase() + currentBox.slice(1);
  const debounceRef = useRef(null);
  const searchRef = useRef(null);

  const handleChange = async (e) => {
    dispatch(setLoading(true));
    const query = e.target.value;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      console.log(query);
      try {
        const response = await axios.get(`${EMAIL_END_POINT}/searchMails`, {
          params: {
            query: query,
            box: currentBox,
          },
          withCredentials: true,
        });
        dispatch(setMails(response.data.mails));
        dispatch(setMail(response.data.mails[0]));
        dispatch(setCurrentIndex(0));
        setSearch(query.trim());
        dispatch(setLoading(false));
      } catch (error) {
        console.log(error);
      }
    }, 1000);
  };

  useEffect(() => {
    const markInstance = new Mark(searchRef.current);
    if (searchValue) {
      markInstance.unmark({
        done: () => {
          markInstance.mark(searchValue);
        }
      })
    } else {
      markInstance.unmark();
    }
  }, [searchValue]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await axios.get(`${EMAIL_END_POINT}/getProfile`, { withCredentials: true });
        for (const label in response.data.response) {
          dispatch(setLength({ key: `${label.toLowerCase()}`, value: response.data.response[label] }));
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchProfile();
  }, [dispatch])

  return (
    <div ref={searchRef} className="h-screen flex items-center">
      { user ?
      <Card className="ContainerCard h-[95vh] w-[97vw] mx-auto flex overflow-hidden card">
        <TooltipProvider>
          <div className="w-[15%] backdrop-blur-lg">
            <p className="px-3 pt-2 text-[13px] text-foreground/85 font-semibold">Favourites</p>
            <Navigation
              isCollapsed={false}
              links={[
                {
                  title: "Inbox",
                  label: `${lengths["inbox"]}`,
                  icon: Inbox,
                  variant: `${currentBox === "inbox" ? "default" : "ghost"}`,
                },
                {
                  title: "Drafts",
                  label: `${lengths["drafts"]}`,
                  icon: File,
                  variant: `${currentBox === "drafts" ? "default" : "ghost"}`,
                },
                {
                  title: "Sent",
                  label: `${lengths["sent"]}`,
                  icon: Send,
                  variant: `${currentBox === "sent" ? "default" : "ghost"}`,
                },
                {
                  title: "Junk",
                  label: `${lengths["junk"]}`,
                  icon: ArchiveX,
                  variant: `${currentBox === "junk" ? "default" : "ghost"}`,
                },
                {
                  title: "Trash",
                  label: `${lengths["trash"]}`,
                  icon: Trash2,
                  variant: `${currentBox === "trash" ? "default" : "ghost"}`,
                },
                {
                  title: "Archive",
                  label: `${lengths["archive"]}`,
                  icon: Archive,
                  variant: `${currentBox === "archive" ? "default" : "ghost"}`,
                },
                {
                  title: "Important",
                  label: `${lengths["important"]}`,
                  icon: Star,
                  variant: `${currentBox === "important" ? "default" : "ghost"}`,
                }
              ]}
            />
            {/* <Separator /> */}
            <div className="mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="flex justify-center">
                  <Button variant="ghost" className="w-[90%] h-[35px] mx-auto bg-primary text-secondary">
                    <Palette className="h-5 w-4 mr-1" />
                    <span>Themes</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">

                  <DropdownMenuItem onClick={() => toggleTheme('light')} className="flex justify-between"><span>Light</span><span className="h-[18px] w-[20px] bg-white rounded-sm"></span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleTheme('blue')} className="flex justify-between"><span>Blue</span><span className="h-[18px] w-[20px] bg-[#7DE2FC] rounded-sm"></span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleTheme('green')} className="flex justify-between"><span>Green</span><span className="h-[18px] w-[20px] bg-[#00FF7F] rounded-sm"></span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleTheme('purple')} className="flex justify-between"><span>Purple</span><span className="h-[18px] w-[20px] bg-[#7028e4] rounded-sm"></span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleTheme('yellow')} className="flex justify-between"><span>Yellow</span><span className="h-[18px] w-[20px] bg-[#ffe259] rounded-sm"></span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleTheme('dark')} className="flex justify-between"><span>Dark</span><span className="h-[18px] w-[20px] bg-[#000000] rounded-sm border-[1px] border-[#c4c4c441] "></span></DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="absolute bottom-0 w-full p-[2px]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="text-[13px] bg-background">
                  <Button className="w-full flex-col items-start py-6 hover:bg-secondary text-foreground font-light rounded-e-none rounded-tl-none rounded-bl-[10px]">
                    <span className="flex items-center">{user?.name}<MoreVertical className="text-foreground mx-1 my-0" size={13} /></span>
                    <span className="text-muted-foreground text-xs">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem className="text-sm" onClick={() => Logout() }>Logout <LogOut className="mx-1" size={12} /></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Separator orientation="vertical" />
          <div className="w-[45%] h-[100%] bg-background">
            <Tabs defaultValue="all">
              <div className="flex items-center px-4 py-2">
                <h1 className="text-xl font-bold">{BoxCapital}</h1>
                <TabsList className="ml-auto">
                  <TabsTrigger
                    value="all"
                    onClick={() => { dispatch(setMail(null)); dispatch(setCurrentIndex(undefined)) }}
                    className="text-zinc-400 dark:text-zinc-200"
                  >
                    All mail
                  </TabsTrigger>
                  <TabsTrigger
                    onClick={() => { dispatch(setMail(null)); dispatch(setCurrentIndex(undefined)) }}
                    value="unread"
                    className="text-zinc-400 dark:text-zinc-200"
                  >
                    Unread
                  </TabsTrigger>
                </TabsList>
              </div>
              <Separator />
              <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form onSubmit={(e) => { e.preventDefault() }}>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input onChange={(e) => handleChange(e)} placeholder="Search" className="pl-8" />
                  </div>
                </form>
              </div>
              <div>
                <Outlet />
              </div>
            </Tabs>
          </div>
          <Separator orientation="vertical" />
          <div className="w-[45%] bg-transparent">
            <MailDisplay mail={mail} searchValue={searchValue} />
          </div>
        </TooltipProvider>
      </Card> 
      : 
      <p className="text-center">Login brother/sister</p>
      }
    </div>
  )
}
export default Home;