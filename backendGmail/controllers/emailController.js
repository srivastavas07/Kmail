import { google } from 'googleapis';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { geminiHelper } from './gemini.js';
import { RefreshToken } from "../model/RefreshToken.js"
import axios from "axios";

dotenv.config({
  path: './.env'
});

//GLOBAL VARIABLES FOR MAILS

var subject = "Subject", from = "Unknown", date = "No date", text = "No text found.", htmlTemplate = `<html>
<head>
  <style>
    body {
      font-family: sans-serif;
      line-height: 1.6;
      font-size: 18px;
      color: #ff4d4f; /* Red for error */
      text-align: center;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .error-icon {
      position:relative;
      width: 50px;
      height: 50px;
      margin-bottom: 0px;
    }
  </style>
</head>
<body>
<div>
    <svg class="error-icon" width="24px" height="24px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg" aria-labelledby="errorIconTitle" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" color="red"> <title id="errorIconTitle">Error</title> <path d="M12 8L12 13"/> <line x1="12" y1="16" x2="12" y2="16"/> <circle cx="12" cy="12" r="10"/> </svg>
    <p>Nothing found. <br/> Please open Gmail : for further information.</p>
  </div>
</body>
</html>`, htmlData = "Nothing found", to = "You", labels = [], read, id, name, threadId;

//HANDLING TOKEN AND AUTHENTICATION AND LOGOUT

export const findRefreshToken = async (userEmail) => {
  try {
    const token = await RefreshToken.findOne({ email: userEmail });
    return token.token;
  } catch (error) {
    console.log(error);
  }
}

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export const isAuthenticated = async (req, res, next) => {
  try {
    const { userEmail } = req.cookies;
    console.log("Current user ->" + userEmail);
    if (!userEmail) return res.status(200).json({ success: false, message: "User not authorised!" })
    const REFRESH_TOKEN = await findRefreshToken(userEmail);
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    next();
  } catch (error) {
    console.log(error);
  }
}
export const getRefreshToken = async (req, res) => {
  const { code } = req.body;
  try {

    const result = await oauth2Client.getToken(code);
    oauth2Client.setCredentials({ refresh_token: result.tokens.refresh_token });

    const userDetails = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${result.tokens.access_token}`
      }
    })

    const Token = await RefreshToken.findOne({ email: userDetails.data.email });

    if (Token) {

      Token.token = result.tokens.refresh_token;
      Token.name = userDetails.data.name;
      await Token.save();

    } else {

      await RefreshToken.create({
        name: userDetails.data.name,
        token: result.tokens.refresh_token,
        email: userDetails.data.email,
      });

    }

    return res.status(200).cookie('userEmail', userDetails.data.email, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      // secure: true, it only works with https
      sameSite: 'lax' //when production make this none.
    }).json({
      success: true,
      message: "Token generated successfully",
      user: userDetails.data,
    });

  } catch (error) {

    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate refresh token"
    });

  }

}
export const logout = (req, res) => {
  try {
    return res.status(200).clearCookie('userEmail').json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to logout"
    });
  }
}

// REPETATIVE FUNCTIONS

const extractParts = (parts) => {
  if (!parts) return null;
  for (const part of parts) {
    if (part.mimeType === "text/html") {
      return part.body.data;
    } else if (part.mimeType === "multipart/related") {
      return extractParts(part.parts);
    } else if (part.parts) {
      return extractParts(part.parts);
    }
  }
  return null;
}
const decodeBase64 = (htmlPart) => {
  return Buffer.from(htmlPart, 'base64').toString('utf-8');
}

// FETCH MAILS-------

export const sendMails = async (req, res) => {

  // mailContent = the mail whom ull reply.. if replying
  
  const { to ,subject, generatedContent, mailContent } = req.body;
  const {userEmail} = req.cookies;
  const content = await geminiHelper("(GENERATE ONLY THE RESPONSE I ASKED FOR NO EXPLANATION NO EXTRA DATA OTHER THAN ASKED, ONLY HTML DATA) provide the html version for this mail with proper normal formatting and indentation, font-family as arial and font size should be 14px this is the mailContent ------>" + generatedContent);
  const regex = /<!DOCTYPE html>([\s\S]*?)<\/html>/;
  const cleanedContent = content.match(regex);

  try {

    const REFRESH_TOKEN = await findRefreshToken(userEmail);
    console.log(REFRESH_TOKEN);
    const accessToken = await oauth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: userEmail,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken
      }
    });
    const mailOptions = {
      from: userEmail,
      to: to,
      subject: subject || `Replying ${mailContent.name}` ,
      text: generatedContent,
      html: cleanedContent[0],
    };
    const result = await transport.sendMail(mailOptions);
    console.log(result);
    return res.status(200).json({
      success: true,
      message: "Mail sent successfully!",
      response: result
    });
  } catch (error) {
    console.log(error);
  }
}
export const readMails = async (req, res) => {
  console.log("Reading Mails");
  const allMessages = [];
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const result = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:inbox',
      maxResults: 108,
    });
    const messages = result.data.messages;
    if (result.data.resultSizeEstimate <= 0) {
      console.log("No Messages found!");
      return res.status(200).json({
        success: true,
        message: "No mails in inbox!",
        mails: [],
      });
    } else {
      const messagePromise = messages.map(async (message) => {
        const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });
        if (messageDetails.data.payload) {
          if (messageDetails.data.payload.headers) {
            threadId = messageDetails.data.threadId;
            subject = messageDetails.data.payload.headers.find(header => header.name === 'Subject')?.value;
            to = messageDetails.data.payload.headers.find(header => header.name === 'To')?.value;
            from = messageDetails.data.payload.headers.find(header => header.name === 'From')?.value;
            date = messageDetails.data.payload.headers.find(header => header.name === 'Date')?.value;
            id = messageDetails.data.id;
            read = !messageDetails.data.labelIds.includes("UNREAD");
            text = messageDetails.data.snippet;
            const str = messageDetails.data.payload.headers.find(header => header.name === "From")?.value;
            name = str.match(/^([^<]+)\s*</);
            name = name ? name[1].trim() : str;
            labels = messageDetails.data.labelIds;
          }
          if (messageDetails.data.payload.parts) {
            const htmlPart = extractParts(messageDetails.data.payload.parts);
            const htmlContent = decodeBase64(htmlPart);
            htmlData = htmlContent;
            if (htmlData === "Nothing found") {
              htmlData = htmlTemplate;
            }
          } else {
            if (messageDetails.data.payload.body.data) {
              const htmlPart = messageDetails.data.payload.body.data;
              if (htmlPart) {
                const htmlContent = Buffer.from(htmlPart, 'base64').toString('utf-8');
                htmlData = htmlContent;
              }
            }
          }
          allMessages.push({ id, threadId, read, labels, name, subject, from, to, date, text, htmlData });
        }
      })
      await Promise.all(messagePromise);
      allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.status(200).json({
        success: true,
        length: allMessages.length,
        mails: allMessages,
        message: "Mails fetched successfully!"
      });

    }
  } catch (error) {
    console.log(error);
  }
}
export const sentMails = async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const sent = await gmail.users.messages.list({
      userId: 'me', q: 'in:sent', maxResults: 100
    })

    const sentThreads = sent.data.messages;

    const sentMails = [];
    if (sent.data.resultSizeEstimate <= 0) {
      return res.status(200).json({
        success: true,
        mails: [],
        message: "No Sent Mails found!"
      })
    } else {
      const sentPromises = sentThreads.map(async (sentThread) => {
        const messageDetails = await gmail.users.messages.get({
          userId: 'me', id: sentThread.id
        })
        if (messageDetails.data.payload) {
          if (messageDetails.data.payload.headers) {
            threadId = messageDetails.data.threadId;
            subject = messageDetails.data.payload.headers.find(header => header.name === 'Subject')?.value;
            to = messageDetails.data.payload.headers.find(header => header.name === 'To')?.value;
            from = messageDetails.data.payload.headers.find(header => header.name === 'From')?.value;
            date = messageDetails.data.payload.headers.find(header => header.name === 'Date')?.value;
            id = messageDetails.data.id;
            read = !messageDetails.data.labelIds.includes("UNREAD");
            text = messageDetails.data.snippet;
            const str = messageDetails.data.payload.headers.find(header => header.name === "From")?.value;
            name = str.match(/^([^<]+)\s*</);
            name = name ? name[1].trim() : str;
            labels = messageDetails.data.labelIds;
          }
          if (messageDetails.data.payload.parts) {
            const htmlPart = extractParts(messageDetails.data.payload.parts);
            const htmlContent = decodeBase64(htmlPart);
            htmlData = htmlContent;
            if (htmlData === "Nothing found") {
              htmlData = htmlTemplate;
            }
          } else {
            if (messageDetails.data.payload.body.data) {
              const htmlPart = messageDetails.data.payload.body.data;
              if (htmlPart) {
                const htmlContent = Buffer.from(htmlPart, 'base64').toString('utf-8');
                htmlData = htmlContent;
              }
            }
          }
        }
        sentMails.push({ id, threadId, read, labels, name, subject, from, to, date, text, htmlData });
      })
      await Promise.all(sentPromises);
      sentMails.sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.status(200).json({
        success: true,
        mails: sentMails,
        message: "Sent fetched successfully!"
      });
    }
  } catch (error) {
    console.log(error);
  }
}
export const searchMails = async (req, res) => {
  const allMessages = [];
  const { query, box } = req.query;
  const tag = box === 'junk' ? "SPAM" : box.toUpperCase();
  var searchQuery;
  if (query.trim() === "") {
    searchQuery = `label:${tag}`
  } else {
    searchQuery = query;
  }
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const result = await gmail.users.messages.list({
    userId: 'me', q: searchQuery, maxResults: 100,
  })
  if (result.data.resultSizeEstimate <= 0) {
    return res.status(200).json({
      success: true,
      mails: [],
      message: "No mails found..",
    })
  }
  const messages = result.data.messages;
  const messagesPromise = messages?.map(async (message) => {
    const messageDetails = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
    })

    if (messageDetails.data.payload) {
      if (messageDetails.data.payload.headers) {
        threadId = messageDetails.data.threadId;
        subject = messageDetails.data.payload.headers.find(header => header.name === 'Subject')?.value;
        to = messageDetails.data.payload.headers.find(header => header.name === 'To')?.value;
        from = messageDetails.data.payload.headers.find(header => header.name === 'From')?.value;
        date = messageDetails.data.payload.headers.find(header => header.name === 'Date')?.value;
        id = messageDetails.data.id;
        read = !messageDetails.data.labelIds.includes("UNREAD");
        text = messageDetails.data.snippet;
        const str = messageDetails.data.payload.headers.find(header => header.name === "From")?.value;
        name = str.match(/^([^<]+)\s*</);
        name = name ? name[1].trim() : str;
        labels = messageDetails.data.labelIds;
      }
      if (messageDetails.data.payload.parts) {
        const htmlPart = extractParts(messageDetails.data.payload.parts);
        const htmlContent = decodeBase64(htmlPart);
        htmlData = htmlContent;
        if (htmlData === "Nothing found") {
          htmlData = htmlTemplate;
        }
      } else {
        if (messageDetails.data.payload.body.data) {
          const htmlPart = messageDetails.data.payload.body.data;
          if (htmlPart) {
            const htmlContent = Buffer.from(htmlPart, 'base64').toString('utf-8');
            htmlData = htmlContent;
          }
        }
      }
    }
    allMessages.push({ id, threadId, read, labels, name, subject, from, to, date, text, htmlData });
  })
  await Promise.all(messagesPromise);
  allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
  return res.status(200).json({
    success: true,
    mails: allMessages,
    message: "Mails fetched Successfully..",
    length: messages?.length,
  })

}
export const draftMails = async (req, res) => {
  const allMessages = [];
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const result = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      q: 'in:draft'
    });
    if (result.data.resultSizeEstimate <= 0) {
      console.log("No Messages found!");
      return res.status(200).json({
        success: true,
        message: "No mails in draft!",
        mails: [],
      });
    } else {
      const messages = result.data.messages;
      const messagePromise = messages.map(async (message) => {
        const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });
        if (messageDetails.data.payload) {
          if (messageDetails.data.payload.headers) {
            threadId = messageDetails.data.threadId;
            subject = messageDetails.data.payload.headers.find(header => header.name === 'Subject')?.value;
            to = messageDetails.data.payload.headers.find(header => header.name === 'To')?.value;
            from = messageDetails.data.payload.headers.find(header => header.name === 'From')?.value;
            date = messageDetails.data.payload.headers.find(header => header.name === 'Date')?.value;
            id = messageDetails.data.id;
            read = !messageDetails.data.labelIds.includes("UNREAD");
            text = messageDetails.data.snippet;
            const str = messageDetails.data.payload.headers.find(header => header.name === "From")?.value;
            name = str.match(/^([^<]+)\s*</);
            name = name ? name[1].trim() : str;
            labels = messageDetails.data.labelIds;
          }
          if (messageDetails.data.payload.parts) {
            const htmlPart = extractParts(messageDetails.data.payload.parts);
            const htmlContent = decodeBase64(htmlPart);
            htmlData = htmlContent;
            if (htmlData === "Nothing found") {
              htmlData = htmlTemplate;
            }
          } else {
            if (messageDetails.data.payload.body.data) {
              const htmlPart = messageDetails.data.payload.body.data;
              if (htmlPart) {
                const htmlContent = Buffer.from(htmlPart, 'base64').toString('utf-8');
                htmlData = htmlContent;
              }
            }
          }
          allMessages.push({ id, threadId, read, labels, name, subject, from, to, date, text, htmlData });
        }
      })
      await Promise.all(messagePromise);
      allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.status(200).json({
        success: true,
        length: allMessages.length,
        mails: allMessages,
        message: "Drafts fetched successfully!"
      });

    }
  } catch (error) {
    console.log(error);
  }
}
export const archiveMails = async (req, res) => {
  const allMessages = [];
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const result = await gmail.users.messages.list({
      userId: 'me',
      q: '-in:inbox -in:sent -in:trash -in:drafts -in:spam',
      maxResults: 108,
    });
    if (result.data.resultSizeEstimate <= 0) {
      console.log("No Messages found!");
      return res.status(200).json({
        success: true,
        message: "No mails in archive!",
        mails: [],
      });
    } else {
      const messages = result.data.messages;
      const messagePromise = messages.map(async (message) => {
        const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });
        if (messageDetails.data.payload) {
          if (messageDetails.data.payload.headers) {
            threadId = messageDetails.data.threadId;
            subject = messageDetails.data.payload.headers.find(header => header.name === 'Subject')?.value;
            to = messageDetails.data.payload.headers.find(header => header.name === 'To')?.value;
            from = messageDetails.data.payload.headers.find(header => header.name === 'From')?.value;
            date = messageDetails.data.payload.headers.find(header => header.name === 'Date')?.value;
            id = messageDetails.data.id;
            read = !messageDetails.data.labelIds.includes("UNREAD");
            text = messageDetails.data.snippet;
            const str = messageDetails.data.payload.headers.find(header => header.name === "From")?.value;
            name = str.match(/^([^<]+)\s*</);
            name = name ? name[1].trim() : str;
            labels = messageDetails.data.labelIds;
          }
          if (messageDetails.data.payload.parts) {
            const htmlPart = extractParts(messageDetails.data.payload.parts);
            const htmlContent = decodeBase64(htmlPart);
            htmlData = htmlContent;
            if (htmlData === "Nothing found") {
              htmlData = htmlTemplate;
            }
          } else {
            if (messageDetails.data.payload.body.data) {
              const htmlPart = messageDetails.data.payload.body.data;
              if (htmlPart) {
                const htmlContent = Buffer.from(htmlPart, 'base64').toString('utf-8');
                htmlData = htmlContent;
              }
            }
          }
          allMessages.push({ id, threadId, read, labels, name, subject, from, to, date, text, htmlData });
        }
      })
      await Promise.all(messagePromise);
      allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.status(200).json({
        success: true,
        length: allMessages.length,
        mails: allMessages,
        message: "Archive fetched successfully!"
      });

    }
  } catch (error) {
    console.log(error);
  }
}
export const trashMails = async (req, res) => {
  const allMessages = [];
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const result = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:trash -in:draft',
      maxResults: 108,
    });
    if (result.data.resultSizeEstimate <= 0) {
      console.log("No Messages found!");
      return res.status(200).json({
        success: true,
        message: "No mails in trash!",
        mails: [],
      });
    } else {
      const messages = result.data.messages;
      const messagePromise = messages.map(async (message) => {
        const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });
        if (messageDetails.data.payload) {
          if (messageDetails.data.payload.headers) {
            threadId = messageDetails.data.threadId;
            subject = messageDetails.data.payload.headers.find(header => header.name === 'Subject')?.value;
            to = messageDetails.data.payload.headers.find(header => header.name === 'To')?.value;
            from = messageDetails.data.payload.headers.find(header => header.name === 'From')?.value;
            date = messageDetails.data.payload.headers.find(header => header.name === 'Date')?.value;
            id = messageDetails.data.id;
            read = !messageDetails.data.labelIds.includes("UNREAD");
            text = messageDetails.data.snippet;
            const str = messageDetails.data.payload.headers.find(header => header.name === "From")?.value;
            name = str.match(/^([^<]+)\s*</);
            name = name ? name[1].trim() : str;
            labels = messageDetails.data.labelIds;
          }
          if (messageDetails.data.payload.parts) {
            const htmlPart = extractParts(messageDetails.data.payload.parts);
            const htmlContent = decodeBase64(htmlPart);
            htmlData = htmlContent;
            if (htmlData === "Nothing found") {
              htmlData = htmlTemplate;
            }
          } else {
            if (messageDetails.data.payload.body.data) {
              const htmlPart = messageDetails.data.payload.body.data;
              if (htmlPart) {
                const htmlContent = Buffer.from(htmlPart, 'base64').toString('utf-8');
                htmlData = htmlContent;
              }
            }
          }
          allMessages.push({ id, threadId, read, labels, name, subject, from, to, date, text, htmlData });
        }
      })
      await Promise.all(messagePromise);
      allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.status(200).json({
        success: true,
        length: allMessages.length,
        mails: allMessages,
        message: "Trash fetched successfully!"
      });

    }
  } catch (error) {
    console.log(error);
  }
}
export const junkMails = async (req, res) => {
  const allMessages = [];
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const result = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:spam',
      maxResults: 108,
    });
    if (result.data.resultSizeEstimate <= 0) {
      console.log("No Messages found!");
      return res.status(200).json({
        success: true,
        message: "No mails in spam!",
        mails: [],
      });
    } else {
      const messages = result.data.messages;
      const messagePromise = messages.map(async (message) => {
        const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });
        if (messageDetails.data.payload) {
          if (messageDetails.data.payload.headers) {
            threadId = messageDetails.data.threadId;
            subject = messageDetails.data.payload.headers.find(header => header.name === 'Subject')?.value;
            to = messageDetails.data.payload.headers.find(header => header.name === 'To')?.value;
            from = messageDetails.data.payload.headers.find(header => header.name === 'From')?.value;
            date = messageDetails.data.payload.headers.find(header => header.name === 'Date')?.value;
            id = messageDetails.data.id;
            read = !messageDetails.data.labelIds.includes("UNREAD");
            text = messageDetails.data.snippet;
            const str = messageDetails.data.payload.headers.find(header => header.name === "From")?.value;
            name = str.match(/^([^<]+)\s*</);
            name = name ? name[1].trim() : str;
            labels = messageDetails.data.labelIds;
          }
          if (messageDetails.data.payload.parts) {
            const htmlPart = extractParts(messageDetails.data.payload.parts);
            const htmlContent = decodeBase64(htmlPart);
            htmlData = htmlContent;
            if (htmlData === "Nothing found") {
              htmlData = htmlTemplate;
            }
          } else {
            if (messageDetails.data.payload.body.data) {
              const htmlPart = messageDetails.data.payload.body.data;
              if (htmlPart) {
                const htmlContent = Buffer.from(htmlPart, 'base64').toString('utf-8');
                htmlData = htmlContent;
              }
            }
          }
          allMessages.push({ id, threadId, read, labels, name, subject, from, to, date, text, htmlData });
        }
      })
      await Promise.all(messagePromise);
      allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.status(200).json({
        success: true,
        length: allMessages.length,
        mails: allMessages,
        message: "Spam fetched successfully!"
      });

    }
  } catch (error) {
    console.log(error);
  }
  //Junk and Spam are the same things..
}
export const importantMails = async (req, res) => {
  const allMessages = [];
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const result = await gmail.users.messages.list({
      userId: 'me',
      q: 'label:important',
      maxResults: 108,
    });
    if (result.data.resultSizeEstimate <= 0) {
      console.log("No Messages found!");
      return res.status(200).json({
        success: true,
        message: "No mails in important!",
        mails: [],
      });
    } else {
      const messages = result.data.messages;
      const messagePromise = messages.map(async (message) => {
        const messageDetails = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });
        if (messageDetails.data.payload) {
          if (messageDetails.data.payload.headers) {
            threadId = messageDetails.data.threadId;
            subject = messageDetails.data.payload.headers.find(header => header.name === 'Subject')?.value;
            to = messageDetails.data.payload.headers.find(header => header.name === 'To')?.value;
            from = messageDetails.data.payload.headers.find(header => header.name === 'From')?.value;
            date = messageDetails.data.payload.headers.find(header => header.name === 'Date')?.value;
            id = messageDetails.data.id;
            read = !messageDetails.data.labelIds.includes("UNREAD");
            text = messageDetails.data.snippet;
            const str = messageDetails.data.payload.headers.find(header => header.name === "From")?.value;
            name = str.match(/^([^<]+)\s*</);
            name = name ? name[1].trim() : str;
            labels = messageDetails.data.labelIds;
          }
          if (messageDetails.data.payload.parts) {
            const htmlPart = extractParts(messageDetails.data.payload.parts);
            const htmlContent = decodeBase64(htmlPart);
            htmlData = htmlContent;
            if (htmlData === "Nothing found") {
              htmlData = htmlTemplate;
            }
          } else {
            if (messageDetails.data.payload.body.data) {
              const htmlPart = messageDetails.data.payload.body.data;
              if (htmlPart) {
                const htmlContent = Buffer.from(htmlPart, 'base64').toString('utf-8');
                htmlData = htmlContent;
              }
            }
          }
          allMessages.push({ id, threadId, read, labels, name, subject, from, to, date, text, htmlData });
        }
      })
      await Promise.all(messagePromise);
      allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.status(200).json({
        success: true,
        length: allMessages.length,
        mails: allMessages,
        message: "Important mails fetched!"
      });
    }
  } catch (error) {
    console.log(error);
  }
}

//MAIL ACTIONS-----

export const deleteMail = async (req, res) => {
  const { id } = req.params;
  const messageId = id;
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const response = await gmail.users.messages.trash({
      userId: 'me', id: messageId,
    })
    return res.status(200).json({
      success: true,
      message: "Mail moved to trash.",
      response: response.data
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.response.data.error.message,
    })
  }
}
export const deletePermanently = async (req, res) => {
  const { id } = req.params;
  const messageId = id;
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const response = await gmail.users.messages.delete({
      userId: 'me', id: messageId,
    })
    return res.status(200).json({
      success: true,
      message: "Mail deleted successfully.",
      response: response.data
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.response.data.error.message,
    })
  }
}
export const archiveMail = async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const { id } = req.params;
    const response = await gmail.users.messages.modify({
      userId: 'me',
      id: id,
      resource: {
        removeLabelIds: ['INBOX']
      }
    });
    return res.status(200).json({
      success: true,
      message: "Mail archived successfully!",
      response: response.data
    })
  } catch (error) {
    console.log(error);
  }
}
export const unArchiveMail = async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const { id } = req.params;
    const response = await gmail.users.messages.modify({
      userId: 'me',
      id: id,
      resource: {
        addLabelIds: ['INBOX']
      }
    });
    return res.status(200).json({
      success: true,
      message: "Mail moved to Inbox!",
      response: response.data
    })
  } catch (error) {
    console.log(error);
  }
}
export const moveToJunk = async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const { id } = req.params;
    const response = await gmail.users.messages.modify({
      userId: 'me',
      id: id,
      resource: {
        addLabelIds: ['SPAM']
      }
    });
    return res.status(200).json({
      success: true,
      message: "Mail moved to Spam!",
      response: response.data,
    })
  } catch (error) {
    console.log(error);
  }
}
export const markAsImportant = async (req, res) => {
  const { id } = req.params;
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const response = await gmail.users.messages.modify({
      userId: 'me',
      id: id,
      resource: {
        addLabelIds: ['IMPORTANT'], // Add the important label
      },
    });
    return res.status(200).json({
      success: true,
      message: "Mail marked as important!",
      response: response.data,
    });
  } catch (error) {
    console.error('Error marking email as important:', error);
  }
};
export const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    const response = await gmail.users.messages.modify({
      userId: 'me',
      id: id,
      resource: {
        removeLabelIds: ['UNREAD'], // Remove the UNREAD label to mark as read
      }
    });
    return res.status(200).json({
      success: true,
      message: "Mail marked as read!",
      response: response.data,
    });
  } catch (error) {
    console.error('Error marking email as read:', error);
  }
};
export const markAsUnread = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const response = await gmail.users.messages.modify({
      userId: 'me',
      id: id,
      resource: {
        addLabelIds: ['UNREAD'],
      },
    });
    console.log(response.data);
    return res.status(200).json({
      success: true,
      message: "Mail marked as unread!",
      response: response.data,
    });
  } catch (error) {
    console.error('Error marking email as unread:', error);
  }
};
export const mailBoxInfo = async (req, res) => {
  const labelsDetails = {};
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const response = await gmail.users.labels.list({
      userId: 'me',
    });

    const labels = response.data.labels;

    const filteredLabels = labels.filter(label =>
      ["SPAM", "IMPORTANT", "INBOX", "TRASH", "DRAFT", "SENT"].includes(label.name)
    );

    const labelPromises = filteredLabels.map(async (label) => {
      const message = await gmail.users.messages.list({
        userId: 'me',
        q: `in:${label.name}`,
      });
      labelsDetails[label.name] = message.data.resultSizeEstimate || 0;
    });

    await Promise.all(labelPromises);

    return res.status(200).json({
      success: true,
      message: "Mail box info fetched!",
      response: labelsDetails,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mailbox info.",
    });
  }
};
export const snoozeMail = async (req, res) => {
  const { id, snoozeTime } = req.query;
  try {
    // const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    // const response = await gmail.users.messages.modify({
    //   userId: 'me',
    //   id: id,
    //   resource: {
    //     addLabelIds: ['SNOOZED'],
    //   },
    // });
    return res.status(200).json({
      success: true,
      message: "Api doesn’t support snoozing emails",
    });
  } catch (error) {
    console.error('Error snoozing email:', error);
  }
};
export const createLabel = async (req, res) => {
  const { labelName } = req.params;
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  let mutedLabel;
  try {
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
    mutedLabel = labelsResponse.data.labels.find(label => label.name === labelName);

    if (!mutedLabel) {
      const createLabelResponse = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: 'MUTES',
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        }
      });
      mutedLabel = createLabelResponse.data;
      return res.status(200).json({
        success: true,
        message: "Label created!",
        response: mutedLabel,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "label already Exists!",
      });
    }
  } catch (error) {
    console.error('Error creating or finding MUTED label:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to create or find MUTED label",
      error: error.message
    });
  }
}

//UNDER PROGRESS OR FUTURE IMPROVISATIONS

export const getAttachment = async (req, res) => {
  const { attachmentId, messageId } = req.body;
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const result = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId,
    });
    let finalResult = result.data.data.replace(/_/g, '/').replace(/-/g, '+');
    console.log(finalResult);
    return res.status(200).json({
      message: "fetched attachment",
      success: true,
      response: result.data,
    })
  } catch (error) {
    console.log(error);
  }
}
export const getRecipient = async () => {
  return res.status(200).json({
    success: true,
    message: "This application is made by https://k7folio.netlify.app",
    response: users,
  });
}

// https://mail.google.com
// first learn back end developement then only u can make this project on your own..
// BACK AGAIN WITH BACKEND LEARNED. 
