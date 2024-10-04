import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import toast from "react-hot-toast"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import { ClipboardPenLine, Send, Sparkles, X } from "lucide-react"
import { Separator } from "./ui/separator"
import { useGemini } from "../Hooks/useGemini"
import useSendMails from "../Hooks/useSendMail"

export default function ComposeMail({ open, setOpen }) {
    const geminiResult = useGemini();
    const sendMail = useSendMails();
    const [to, setTo] = useState("")
    const [subject, setSubject] = useState("")
    const [body, setBody] = useState("")
    const [promptLoading, setPromptLoading] = useState(false)
    const [prompt, setPrompt] = useState("");

    const handlePromptResult = async () => {
        setPromptLoading(true);
        const promptResult = await geminiResult(prompt);
        const subjectRegex = /(?:^|\n)(?:##\s*)?(?:Subject|Re: Subject|Fw: Subject)?:?\s*(.+)/i;
        const match = subjectRegex.exec(promptResult);
        if (match) {
            const subject = match[1].trim();
            setSubject(subject);
        }
        toast( `⚠️ Please check the subject and mail`);
        setBody(promptResult);
        setPromptLoading(false);
    }
    const handleSend = async() => {
        if(!to || !subject ||!body){
            toast.error("Please fill all the fields");
            return;
        }
         const kam = await sendMail(to,subject,body,null,setBody);
         if(kam){
            resetForm();
         }
    }

    const resetForm = () => {
        setTo("");
        setSubject("");
        setPrompt("");
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent aria-describedby="dialog-description" className="sm:max-w-[60%]">
                <DialogHeader>
                    <DialogTitle className="flex gap-1 items-center"><ClipboardPenLine />Compose mail</DialogTitle>
                </DialogHeader>
                <Separator />
                <div className="grid gap-4 py-4">
                    <div className="flex items-center">
                        <span className="absolute left-9 text-sm">To :</span>
                        <Input
                            id="to"
                            className="pl-10"
                            placeholder="Recipients"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        /></div>
                    <Input
                        id="subject"
                        placeholder="Subject"
                        className=""
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                    <Textarea
                        id="body"
                        placeholder="Compose email"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="min-h-[45vh]"
                    />
                    <Textarea value={prompt} className="min-h-[50px] py-[13.5px] " onChange={(e) => { setPrompt(e.target.value) }} placeholder="write prompt here..⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆" />
                </div>
                <DialogFooter className="sm:justify-between">
                    <div className="flex items-center">
                        <Button type="submit" onClick={handleSend}>
                            <Send className="mr-2 h-4 w-4" /> Send
                        </Button>
                        <Button onClick={handlePromptResult} variant="outline" className="border-primary/30 ml-2" type="button">Generate <Sparkles className="mx-1" size={16} /></Button>
                        {promptLoading ? <div className="loaderPrompt mx-2"></div> : null}
                    </div>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        <X className="mr-2 h-4 w-4" /> Discard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}