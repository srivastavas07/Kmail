import { createSlice } from "@reduxjs/toolkit";
const emailSlice = createSlice({
    name: "emails",
    initialState: {
        mails: [],
        mail: null,
        lengths:{
            inbox: 0,
            sent: 0,
            trash: 0,
            junk: 0,
            drafts: 0,
            archive: 0,
            important:0,
        },
        loading: false,
        searchValue: "",
        currentBox: "inbox",
        currentIndex: undefined,
    },
    reducers: {
        setMails: (state, action) => {
            state.mails = action.payload;
        },
        setMail: (state, action) => {
            state.mail = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setSearchValue: (state, action) => {
            state.searchValue = action.payload;
        },
        setLength: (state, action) => {
            state.lengths[action.payload.key] = action.payload.value;
        },
        setCurrentBox: (state, action) => {
            state.currentBox = action.payload;
        },
        setDelete:(state,action)=>{
            state.mails = state.mails.filter(mail => mail.id !== action.payload);
        },
        setCurrentIndex:(state,action)=>{
            state.currentIndex = action.payload;
        },
        setRead:(state, action)=>{
            state.mails.find(mail => mail.id === action.payload).read = true;
        },
        setUnread:(state,action)=>{
            state.mails.find(mail => mail.id === action.payload).read = false;
        },
        resetState: (state) => {
            state.mails = [];
            state.mail = null;
            state.loading = false;
            state.searchValue = "";
            state.currentBox = "inbox";
            state.currentIndex = undefined;
            state.lengths = {
                inbox: 0,
                sent: 0,
                trash: 0,
                junk: 0,
                drafts: 0,
                archive: 0,
                important: 0,
            };
        },
    },
});
export const { setMails, setMail, setLoading, setSearchValue, setLength, setCurrentBox, setDelete, setCurrentIndex, setRead, setUnread, resetState } = emailSlice.actions;
export default emailSlice.reducer;