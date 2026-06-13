import {Link} from "react-router-dom";
import LogoutBtn from "./LogoutBtn";

import AllUsers from "./AllUsers";
import "../css/index.css";  

function Nav() {
  return (
    <nav className="nav">   
        <h1 className="title">Chat App</h1>
        <div className="nav-links">
            <Link to="/chat" className="nav-link">Chat</Link>
            <Link to="/users" className="nav-link">Users</Link>
            <div className="nav-buttons">
              <button>
              <Link to="/creategroup">create group</Link>
              </button>
              <LogoutBtn />
            </div>
              

        </div>
       
    </nav>
  )
}

export default Nav