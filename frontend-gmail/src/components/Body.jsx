import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./Home";
import InboxContent from "./MailBoxes/Inbox.jsx";
import Notfound from "./Notfound";
import SentContent from "./MailBoxes/SentMails";
import JunkContent from "./MailBoxes/Junk";
import ArchiveContent from "./MailBoxes/Archive";
import TrashContent from "./MailBoxes/Trash";
import DraftContent from "./MailBoxes/Draft";
import ImportantContent from "./MailBoxes/Important.jsx";
import Login from "./Login";

const Body = () => {
    const AppRouter = createBrowserRouter([
        {
            path:"/",
            element:<Home/>,
            children: [
                {
                    path:"/",
                    element:<InboxContent/>
                },
                {
                    path:"/inbox",
                    element:<InboxContent/>
                },{
                    path:"/sent",
                    element:<SentContent/>
                },
                {
                    path:"/junk",
                    element:<JunkContent/>
                },
                {
                    path:"/archive",
                    element:<ArchiveContent/>
                },
                {
                    path:"/trash",
                    element:<TrashContent/>
                },
                {
                    path:"/drafts",
                    element:<DraftContent/>
                },
                {
                    path:"/important",
                    element:<ImportantContent/>
                }

            ]
        },
        {
            path:"/login",
            element:<Login/>
        },
        {
            path:"*",
            element:<Notfound/>
        }
    ])
    return(
        <div>
            <RouterProvider router={AppRouter}/>
        </div>
    )
}

export default Body;