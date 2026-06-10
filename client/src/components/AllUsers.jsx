
import useGetUsers from "../hooks/useGetUsers";

function AllUsers() {
  const { users, isLoading, error } = useGetUsers();
  console.log("Fetched users:", users);
  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users: {error.message}</div>;
  return (
    <div>
      <h1>all users</h1>
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <p>{user.username}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found.</p>
      )}
    </div>

    
  )
}

export default AllUsers