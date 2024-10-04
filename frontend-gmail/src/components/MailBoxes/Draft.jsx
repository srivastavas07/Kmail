import React from 'react'
import Mail from "../MailList";
import { TabsContent } from "../ui/tabs";
import { useSelector } from 'react-redux';
import useDraftMails from '../../Hooks/useDraftMails';

function DraftContent() {
    useDraftMails();
    const {mails} = useSelector((store)=> store.emails);
    return (
        <>
            <TabsContent value="all" className="m-0">
                <Mail items={mails} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
                <Mail items={mails.filter((mail) => !mail.read)} />
            </TabsContent>
        </>
    )
}

export default DraftContent;