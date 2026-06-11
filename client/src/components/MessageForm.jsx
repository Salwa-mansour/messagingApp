import { useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const MessageForm = ({ currentRoom, pendingDM, onMessageSent, onGroupCreated }) => {
  const [text, setText] = useState("");
  const axiosPrivate = useAxiosPrivate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!currentRoom && !pendingDM) return;

    try {
      // Determine endpoint depending on channel context state
      const endpoint = currentRoom 
        ? `/message/send/${currentRoom}` 
        : `/message/send/${pendingDM.id}`;

      const response = await axiosPrivate.post(endpoint, {
        content: text
      });

      // Extract standard database object variations securely
      const savedMessage = response.data?.data || response.data;
      const newlyCreatedGroupId = response.data?.groupId;

      // Pass the new message payload back up to parent message timeline state array
      onMessageSent(savedMessage);
      setText(""); // Instant clean reset of form layout box

      // If backend reports a new group created, run top-level layout transformation cascade
      if (newlyCreatedGroupId && !currentRoom) {
        onGroupCreated(newlyCreatedGroupId);
      }
    } catch (err) {
      console.error("Failed to transmit input content payload:", err);
    }
  };

  // Keep input fields disabled if there is absolutely no room or context target active
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