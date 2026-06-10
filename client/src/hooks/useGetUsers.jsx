import useAxiosPrivate from "./useAxiosPrivate";
import { useEffect, useState } from "react";

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
            if (err.name !== "CanceledError") {
                console.error("Failed to fetch users:", err);
                setError(err);
            }
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    }

    fetchUsers();

    return () => {
        isMounted = false;  

        controller.abort();
    }
    }, [axiosPrivate]); 

    return { users, isLoading, error };
}

export default useGetUsers;