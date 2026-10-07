
import useGetUsers from "../hooks/useGetUsers";
import {useNavigate ,Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMessage} from "@fortawesome/free-solid-svg-icons";
// import ChatDashboard from "./ChatBoard";

function AllUsers() {
  const { users, isLoading, error } = useGetUsers();
  const navigate = useNavigate();

  const  handleSendMessage = (user) => {
    
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
              <button onClick={() => handleSendMessage(user)}>
                <FontAwesomeIcon icon={faMessage} />
               <span>Chat</span>  
                </button>
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