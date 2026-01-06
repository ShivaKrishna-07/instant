import { reducerCases } from "./constants";

export const initialState = {
  userInfo: undefined,  
  newUser: false,
  contactsPage: false,
  currentChatUser: undefined,
  messages: [],
  socket: undefined,
  searchQuery: "",
  searchMatches: [],
  searchIndex: 0,
  // call state
  outgoingCall: null, // { targetId, kind }
  incomingCall: null, // { from, fromMeta, offer, kind }
  callActive: false,
  callKind: 'video',
}

export const reducer = (state, action) => {
  switch (action.type) {
    case reducerCases.SET_USER_INFO:
      return {
        ...state,
        userInfo: action.userInfo,
      };
    case reducerCases.SET_NEW_USER:
      return {
        ...state,
        newUser: action.newUser,
      };
    case reducerCases.SET_ALL_CONTACTS_PAGE:
      return {
        ...state,
        contactsPage: !state.contactsPage,
      };
    case reducerCases.SET_CURRENT_CHAT_USER:
      return {
        ...state,
        currentChatUser: action.user,
      };
    case reducerCases.SET_MESSAGES:
      return {
        ...state,
        messages: action.messages,
      };
    case reducerCases.SET_SOCKET:
      return {
        ...state,
        socket: action.socket,
      };
    case reducerCases.START_CALL:
      return {
        ...state,
        outgoingCall: action.payload || null,
      };
    case reducerCases.CLEAR_OUTGOING_CALL:
      return {
        ...state,
        outgoingCall: null,
      };
    case reducerCases.SET_INCOMING_CALL:
      return {
        ...state,
        incomingCall: action.payload || null,
        callKind: action.payload?.kind || state.callKind,
      };
    case reducerCases.CLEAR_INCOMING_CALL:
      return {
        ...state,
        incomingCall: null,
      };
    case reducerCases.END_CALL:
      return {
        ...state,
        outgoingCall: null,
        incomingCall: null,
        callActive: false,
        callKind: 'video',
      };
    case reducerCases.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.newMessage],
      };
    case reducerCases.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.temp_id && action.temp_id && m.temp_id === action.temp_id
            ? { ...m, ...action.newMessage }
            : m
        ),
      };
    case reducerCases.REMOVE_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter((m) => m.temp_id !== action.temp_id),
      };
    case reducerCases.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.query,
      };
    case reducerCases.SET_SEARCH_RESULTS:
      return {
        ...state,
        searchMatches: action.matches,
      };
    case reducerCases.SET_SEARCH_INDEX:
      return {
        ...state,
        searchIndex: action.index,
      };
    default:
      return state;
  }
}

export default reducer;