import Mark from "mark.js";
import React, { useEffect, useState } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import ComposeMail from './ComposeMail.jsx';
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  Trash2,
  ShieldAlert,
  ArchiveRestore,
  Star,
  Sparkles,
  LogOut,
  Mail,
  SquarePen,
  Send
} from "lucide-react"
import { format, addHours, addDays, nextSaturday } from "date-fns"
import { Calendar } from './ui/calendar';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from './ui/dropdown-menu';
import { Label } from './ui/label';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { useTheme } from '../Context /ThemeContext';
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMail, setCurrentIndex } from '../Redux/emailSlice';
import { toast } from 'react-hot-toast';
import { useDeleteMail, useDeletePermanently } from '../Hooks/useDeleteMails';
import { useUnreadMail } from "../Hooks/useReadMail";
import { useCallback } from "react";
import useSnoozeMail from '../Hooks/useSnoozeMail';
import useArchive from "../Hooks/useArchived";
import useMarkImportant from "../Hooks/useMarkImportant";
import useJunk from "../Hooks/useJunk";
import useUnarchived from "../Hooks/useUnarhived";
import useSendMails from "../Hooks/useSendMail";
import useLogout from "../Hooks/useLogOut"
import { useGemini } from "../Hooks/useGemini";


function MailDisplay({ mail, searchValue }) {
  const emailType = mail?.labels?.some(label => ['DRAFTS'].includes(label));
  const reply = useRef(null);
  const scrollableDiv = useRef();
  const { theme } = useTheme();
  const { currentIndex, mails, currentBox } = useSelector(store => store.emails);
  const [selectedDate, setSelectedDate] = useState();
  const [prompt, setPrompt] = useState("");
  const [generatedMail, setGeneratedMail] = useState("");
  const [compose, setCompose] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);

  const iframeRef = useRef(null);
  const ArchiveMail = useArchive();
  const deleteMail = useDeleteMail();
  const snoozeMail = useSnoozeMail();
  const ImportantMail = useMarkImportant();
  const JunkMail = useJunk();
  const UnarchiveMail = useUnarchived();
  const dispatch = useDispatch();
  const unreadMail = useUnreadMail();
  const Logout = useLogout();
  const deletePermanently = useDeletePermanently();
  const sendMail = useSendMails();
  const geminiResult = useGemini();

  const iconShadow = theme === "light" ? "" : "bg-[#00000050]";
  const SeparatorLine = theme === "light" ? "bg-black" : "";
  const today = new Date();

  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [isContentUpdated, setIsContentUpdated] = useState(false);

  const applyHighlighting = useCallback(() => {
    if (!iframeRef.current || !searchValue) return;

    const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!iframeDocument || !iframeDocument.body) return;

    const markInstance = new Mark(iframeDocument.body);
    markInstance.unmark({
      done: () => {
        if (searchValue) {
          markInstance.mark(searchValue);
        }
      },
    });
  }, [searchValue]);

  useEffect(() => {
    const iframe = iframeRef.current;

    const onLoad = () => {
      setIsIframeLoaded(true);
    };

    if (iframe) {
      iframe.onload = onLoad;
    }

    return () => {
      if (iframe) {
        iframe.onload = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mail) {
      setIsContentUpdated(false);
      const timeOut = setTimeout(() => setIsContentUpdated(true), 50);
      return () => clearTimeout(timeOut);
    }
  }, [mail]);

  useEffect(() => {
    if (searchValue && isIframeLoaded && isContentUpdated) {
      const timeoutId = setTimeout(applyHighlighting, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isIframeLoaded, isContentUpdated, applyHighlighting, searchValue]);



  const handleDelete = () => {
    if (currentBox !== 'trash') {
      deleteMail(mail.id);
      if (currentIndex === 0) {
        dispatch(setMail(mails[currentIndex + 1]));
      } else {
        dispatch(setMail(mails[currentIndex - 1]));
        dispatch(setCurrentIndex(currentIndex - 1));
      }
    } else {
      deletePermanently(mail.id);
      if (currentIndex === 0) {
        dispatch(setMail(mails[currentIndex + 1]));
      } else {
        dispatch(setMail(mails[currentIndex - 1]));
        dispatch(setCurrentIndex(currentIndex - 1));
      }
    }
  }
  const handleArchive = () => {
    ArchiveMail(mail.id);
    if (currentIndex === 0) {
      dispatch(setMail(mails[currentIndex + 1]));
    } else {
      dispatch(setMail(mails[currentIndex - 1]));
      dispatch(setCurrentIndex(currentIndex - 1));
    }
  }
  const handleUnarchive = () => {
    UnarchiveMail(mail.id);
    if (currentIndex === 0) {
      dispatch(setMail(mails[currentIndex + 1]));
    } else {
      dispatch(setMail(mails[currentIndex - 1]));
      dispatch(setCurrentIndex(currentIndex - 1));
    }
  }
  const handleJunk = () => {
    JunkMail(mail.id);
    if (currentIndex === 0) {
      dispatch(setMail(mails[currentIndex + 1]));
    } else {
      dispatch(setMail(mails[currentIndex - 1]));
      dispatch(setCurrentIndex(currentIndex - 1));
    }
  }
  const handleImportant = () => {
    ImportantMail(mail.id);
    if (currentIndex === 0) {
      dispatch(setMail(mails[currentIndex + 1]));
    } else {
      dispatch(setMail(mails[currentIndex - 1]));
      dispatch(setCurrentIndex(currentIndex - 1));
    }
  }
  const handleDate = (dateString, type = "default") => {
    if (type !== "date") {
      const [day, month, year] = dateString.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      const formattedDate = date.toString();
      dateString = formattedDate;
    }
    setSelectedDate(dateString);
  }
  const handleSnooze = () => {
    if (selectedDate) {
      snoozeMail(mail.id, selectedDate);
    } else {
      toast.error("Please select a date");
    }
  }
  const handlePromptResult = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }
    setPromptLoading(true);
    const promptResult = await geminiResult(prompt);
    setPromptLoading(false);
    setGeneratedMail(promptResult);
  }
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!generatedMail) {
      toast.error("Empty reply can't be sent!")
    };
    const to = mail.labels.includes('SENT') ? mail.to : mail.from;
    sendMail(to, null, generatedMail, mail, setGeneratedMail);
  }

  const handleLogout = () => {
    Logout();
  }
  const scrollToReply = () => {
    if (reply.current && scrollableDiv.current) {
      const replyTop = reply.current.offsetTop;
      const scrollableTop = scrollableDiv.current.offsetTop;
      const scrollPosition = replyTop - scrollableTop - 20;

      scrollableDiv.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
      setTimeout(() => {
        if (reply.current) {
          reply.current.focus();
        }
      })
    }

  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button onClick={() => { setCompose(!compose) }} variant="ghost" size="icon" className={`${iconShadow} ${compose && "bg-accent"}`}>
                  <SquarePen className="h-4 w-4" />
                  <span className="sr-only">Compose</span>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent className="relative z-50">Compose</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button onClick={handleArchive} variant="ghost" size="icon" className={`${iconShadow}`} disabled={!mail || currentBox === "archive"}>
                  <Archive className="h-4 w-4" />
                  <span className="sr-only">Archive</span>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent className="relative z-50">Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button
                  onClick={handleUnarchive}
                  variant="ghost"
                  size="icon"
                  className={`${iconShadow}`}
                  disabled={!mail || currentBox === "inbox"}
                >
                  <ArchiveRestore className="h-4 w-4" />
                  <span className="sr-only">Move to Inbox</span>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Move to Inbox</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button onClick={handleJunk} variant="ghost" size="icon" className={`${iconShadow}`} disabled={!mail}>
                  <ArchiveX className="h-4 w-4" />
                  <span className="sr-only">Move to junk</span>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Move to junk</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button variant="ghost" size="icon" onClick={() => handleDelete()} className={`${iconShadow}`} disabled={!mail}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">{currentBox === "trash" ? "Delete permanently" : "Move to trash"}</span>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>{currentBox === "trash" ? "Delete permanently" : "Move to trash"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button onClick={handleImportant} variant="ghost" size="icon" className={`${iconShadow}`} disabled={!mail}>
                  <Star className="h-4 w-4" />
                  <span className="sr-only">Mark Important</span>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Mark Important</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className={`mx-1 h-6 ${SeparatorLine}`} />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <Button variant="ghost" size="icon" className={`${iconShadow}`} disabled={!mail}>
                      <Clock className="h-4 w-4" />
                      <span className="sr-only">Snooze</span>
                    </Button>
                  </div>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex w-[535px] p-0">
                <div className="flex flex-col gap-2 border-r px-2 py-4">
                  <div className="px-4 text-sm font-medium">Snooze until</div>
                  <div className="grid min-w-[250px] gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => { handleDate(format(today, "dd/MM/yyyy")) }}
                    >
                      Later today{" "}
                      <span className="ml-auto text-muted-foreground">
                        {format(addHours(today, 4), "E, 15:00 b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => { handleDate(format(addDays(today, 1), "dd/MM/yyyy")) }}
                    >
                      Tomorrow
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 1), "E, 15:00 b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => { handleDate(format(nextSaturday(today), "dd/MM/yyyy")) }}
                    >
                      This weekend
                      <span className="ml-auto text-muted-foreground">
                        {format(nextSaturday(today), "E, 15:00 b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => { handleDate(format(addDays(today, 7), "dd/MM/yyyy")) }}
                    >
                      Next week
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 7), "E, 15:00 b")}
                      </span>
                    </Button>
                  </div>
                  <div className='mt-[30%] flex justify-center'>
                    <Button variant="outline" onClick={() => { handleSnooze() }} className="w-full">Snooze</Button>
                  </div>
                </div>
                <div className="p-2">
                  <Calendar mode="single" selected={selectedDate} onSelect={(date) => handleDate(date, "date")} footer={
                    selectedDate ? <p className='text-xs text-muted-foreground mt-1'>Selected: {format(selectedDate, "E MMM dd yyyy 15:00")}</p> : <p className='text-xs text-muted-foreground mt-1'>Pick a date.</p>
                  } />
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>Snooze</TooltipContent>
          </Tooltip>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={() => scrollToReply()} size="icon" className={`${iconShadow}`} disabled={!mail}>
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className={`${iconShadow}`} disabled={!mail}>
                <Forward className="h-4 w-4" />
                <span className="sr-only">Forward</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className={`mx-2 h-6 ${SeparatorLine}`} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className={`${iconShadow}`} disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { unreadMail(mail.id) }}>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem><a href="https://gmail.com" target="_blank" rel="noreferrer" className="flex items-center" >Gmail.com <Mail className="mx-1" size={13} /></a></DropdownMenuItem>
            <DropdownMenuItem onClick={() => { handleLogout() }}>Logout <LogOut className="mx-1" size={13} /></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {!compose ?
        <div ref={scrollableDiv} className="h-full overflow-auto">
          {mail ? (
            <div className="flex flex-1 flex-col bg-background">
              <div className="flex items-start p-4">
                <div className="flex items-start gap-5 text-sm">
                  <Avatar>
                    <AvatarImage alt={mail.name} />
                    <AvatarFallback>
                      {mail.name
                        .split(" ")
                        .map((chunk) => chunk[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">{mail.name}</div>
                    <div className="line-clamp-1 text-xs">{mail.subject}</div>
                    <div className="line-clamp-1 text-xs">
                      <span className="font-medium">From: </span> {mail.from}
                    </div>
                    <div className="line-clamp-1 text-xs">
                      <span className="font-medium">To: </span> {mail.to}
                    </div>
                  </div>
                </div>
                {mail.date && (
                  <div className="ml-auto min-w-[10%] text-xs text-muted-foreground">
                    <p className='inline-block'>{format(new Date(mail.date), "p")}</p>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex-1 whitespace-pre-wrap p-1 text-sm">
                <iframe
                  ref={iframeRef}
                  srcDoc={mail.htmlData}
                  style={{
                    overflowY: "auto",
                    width: '100%',
                    height: '530px',
                    border: 'none',
                    background: 'white',
                    padding: '5px'
                  }}
                  title="Raw HTML Content"
                />
              </div>
              <Separator className="mt-auto" />
              <div className="p-4">
                <form onSubmit={handleEmailSubmit}>
                  <div className="grid gap-4">
                    <Textarea
                      disabled={currentBox === "drafts" || emailType}
                      ref={reply}
                      className="p-4"
                      placeholder={`Reply ${mail.name}...`}
                      value={generatedMail}
                      onChange={(e) => { setGeneratedMail(e.target.value) }}
                    />
                    <Textarea disabled={currentBox === "drafts" || emailType} value={prompt} className="min-h-[50px] py-[13.5px] " onChange={(e) => { setPrompt(e.target.value) }} placeholder="write prompt here..⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆" />
                    <div className="flex items-center">
                      <Label
                        htmlFor="mute"
                        className="flex items-center gap-2 text-xs font-normal"
                      >
                        <Switch id="mute" aria-label="Mute thread" /> Mute this
                        thread
                      </Label>
                      <div className="ml-auto flex items-center">
                        {promptLoading ? <div className="loaderPrompt mx-2"></div> : null}
                        <Button onClick={handlePromptResult} variant="outline" size="sm" className="border-primary/30 py-4" type="button">Generate <Sparkles className="mx-1" size={16} /></Button>
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        className="ml-[5px] py-4"
                        variant="jugaad"
                      >
                        <Send className="mr-1 h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground bg-background h-full flex items-center justify-center">
              <ShieldAlert size={28} className='mx-2 text-primary' /><span>No message selected <span className='text-primary font-bold'>!</span></span>
            </div>
          )}
        </div>
        : <div className="h-full bg-background">
          <ComposeMail setOpen={setCompose} open={compose} />
        </div>
      }
    </div>
  )
}

export default MailDisplay