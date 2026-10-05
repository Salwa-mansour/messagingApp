import { Outlet } from "react-router-dom";
import Nav from "./Nav";
const Layout = () => {
  return (
   <>
      <h1 className="title">Chat App</h1>
      <main>
         <Outlet />
      </main>
       <Nav />
      {/* <footer>
         <p>&copy; 2024 Messaging App. All rights reserved.</p>
      </footer> */}
  </>
  );
};

export default Layout;