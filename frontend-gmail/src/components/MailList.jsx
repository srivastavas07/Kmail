import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { setCurrentIndex, setMail } from '../Redux/emailSlice';
import { MailX } from 'lucide-react';
import  SkeletonCards  from './Skeleton';
import {useReadMail} from '../Hooks/useReadMail';


function Mail({ items }) {

  const dispatch = useDispatch();
  const [bg, setBg] = useState(null);
  const { loading, currentIndex, currentBox } = useSelector(store => store.emails);
  const readMail = useReadMail();
  
  useEffect(() => {
    setBg(currentIndex);
  }, [currentIndex]);

  return (

    <ScrollArea className="h-[79.5vh]">
      <div className="flex flex-col gap-2 p-4 pt-0 overflow-hidden h-full">
      {loading && <SkeletonCards/>}
        { !loading && items.map((item, index) => {
          var date = new Date().getDate() - new Date(item.date).getDate();
          const month = new Date().getMonth() - new Date(item.date).getMonth();
          const year = new Date().getFullYear() - new Date(item.date).getFullYear();
          if(date === 0 && month === 0 && year === 0){
            date = "Today";
          }else if(date === 1 && month === 0 && year === 0){
            date = "Yesterday"
          }else{
            date = format(new Date(item.date),"MMMM dd, yyyy");
          }

          return (
            <button
              key={index}
              onClick={() => { setBg(index); dispatch(setMail(items[index]));dispatch(setCurrentIndex(index)); if(currentBox !== "drafts" && currentBox !== "sent"){readMail(item.id)};}}
              className={cn(
                `flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all ${bg === index ? "bg-accent" : ""} hover:bg-accent`
              )}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{item.name}</div>
                    {!item.read && (
                      <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <div className="ml-auto text-xs">{date}</div>
                </div>
                <div className="text-xs font-medium">{item.subject}</div>
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {item.text.substring(0, 300)}
              </div>
              {item.labels.length ? (
                <div className="flex items-center gap-2">
                  {item.labels.map((label) => (
                    <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </button>
          )
        })}
        {items.length === 0 && !loading && <div className={`text-center h-[70vh] flex justify-center items-center text-muted-foreground`}> <MailX size={28} className='mx-2 text-primary' /><span>No Mails found <span className='text-primary font-bold'>!</span></span></div>}
      </div>
    </ScrollArea>
  );
}

function getBadgeVariantFromLabel(label) {
  if (label.includes("CATEGORY")) {
    return "jugaad";
  }

  if (label.includes("UNREAD")) {
    return "secondary";
  }

  return "outline";
}

export default Mail;
