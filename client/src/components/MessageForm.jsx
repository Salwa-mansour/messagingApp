import { useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const MessageForm = ({ currentRoom, pendingDM, onGroupCreated }) => { // 💡 Removed onMessageSent prop
  const [text, setText] = useState("");
  const axiosPrivate = useAxiosPrivate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!currentRoom && !pendingDM) return;

    try {
      const endpoint = currentRoom?.id
        ? `/message/send/${currentRoom?.id}` 
        : `/message/send/${pendingDM?.id}`;

      // 1. Send the text to the backend database
      const response = await axiosPrivate.post(endpoint, {
        content: text
      });

      const newlyCreatedGroupId = response.data?.groupId;

      // 💡 2. Just clear the input box! 
      // Your ChatDashboard socket listener will automatically catch the server broadcast 
      // and display the message on your screen instantly.
      setText(""); 

      // 3. If a brand new DM room was created, handle the layout switch
      if (newlyCreatedGroupId && !currentRoom) {
        onGroupCreated(newlyCreatedGroupId);
      }
    } catch (err) {
      console.error("Failed to transmit input content payload:", err);
    }
  };

  const isInputDisabled = !currentRoom && !pendingDM;

  return (
    <form className="message-form" onSubmit={handleFormSubmit}>
      <input
        type="text"
        placeholder={pendingDM ? `Message ${pendingDM.username}...` : "Type your message..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isInputDisabled}
      />
      <button type="submit" disabled={isInputDisabled || !text.trim()}>
        Send
      </button>
    </form>
  );
};

export default MessageForm;