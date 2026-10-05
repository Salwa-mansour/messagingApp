import {Link} from "react-router-dom";
import LogoutBtn from "./LogoutBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faUsers,faUserEdit } from "@fortawesome/free-solid-svg-icons";

import AllUsers from "./AllUsers";
import "../css/index.css";  

function Nav() {
  return (
    <nav className="nav">   
       
        <div className="nav-links">
            <Link to="/chat" className="nav-link">
                <FontAwesomeIcon icon={faComments} />
                <span>Chat</span> 
            </Link>
            <Link to="/users" className="nav-link">
                <FontAwesomeIcon icon={faUsers} />
                <span> Users</span>
            </Link>
            {/* <div className="nav-buttons"> */}
              
              <Link to="/creategroup" className="nav-link">
              <FontAwesomeIcon icon={faUserEdit} />
             <span>create group</span> 
              </Link>
             
              <LogoutBtn />
            {/* </div> */}
              

        </div>
       
    </nav>
  )
}

export default Nav