
import useGetUsers from "../hooks/useGetUsers";
import {useNavigate ,Link} from "react-router-dom";
import ChatDashboard from "./ChatBoard";

function AllUsers() {
  const { users, isLoading, error } = useGetUsers();
  const navigate = useNavigate();

  const  handleSendMessage = (user) => {
    console.log("Initiate chat with user ID:", user);
    navigate("/chat", { 
        state: { 
          recipientId: user.id,
          recipientName: user.username
        } 
      });
  };

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users: {error.message}</div>;
  return (
    <>
      <h1 className="title">all users</h1>
    
      {users.length > 0 ? (
        <ul className="users-list">
          {users.map((user) => (
            <li key={user.id}>
              <span>{user.username}</span> 
              <button onClick={() => handleSendMessage(user)}>Chat</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
    </>

    
  )
}

export default AllUsers