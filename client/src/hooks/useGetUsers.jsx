import useAxiosPrivate from "./useAxiosPrivate";
import { useEffect, useState } from "react";
// 💡 Import axios to access the validation helper
import axios from "axios"; 

const useGetUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axiosPrivate.get("/users", { signal: controller.signal });
        if (isMounted) {
          setUsers(response.data);
        }
      } catch (err) {
       
        // Only log real network or authentication failures
        if (isMounted) {
          console.error("Failed to fetch users:", err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;  
      controller.abort();
    };
  }, [axiosPrivate]); 

  return { users, isLoading, error };
};

export default useGetUsers;