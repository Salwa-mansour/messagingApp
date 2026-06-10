import {Link} from "react-router-dom";
import LogoutBtn from "./LogoutBtn";
import Contacts from "./Contacts";
import AllUsers from "./AllUsers";
import "../css/index.css";  

function Nav() {
  return (
    <nav className="nav">   
        <h1 className="nav-title">Chat App</h1>
        <div className="nav-links">
            <Link to="/chat" className="nav-link">Chat</Link>
            <Link to="/users" className="nav-link">Users</Link>
            <Link to="/contacts" className="nav-link">Contacts</Link>
        </div>
        <LogoutBtn />
    </nav>
  )
}

export default Nav