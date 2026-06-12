
import { useState } from "react";
import useGetUsers from "../hooks/useGetUsers";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const CreateGroup = ({ onGroupCreated, onCancel }) => {
  const { users, isLoading, error } = useGetUsers();
  const axiosPrivate = useAxiosPrivate();

  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();

  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!groupName.trim()) {
      setSubmitError("Group name cannot be empty.");
      return;
    }
    
    // 💡 Frontend Validation Check: Must select at least 2 users from the list
    if (selectedUserIds.length < 2) {
      setSubmitError("A group chat requires at least 2 other members to be selected.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosPrivate.post("/group/create", {
        name: groupName,
        userIds: selectedUserIds, 
      });

      if (onGroupCreated) onGroupCreated(response.data?.id || response.data);
      setGroupName("");
      setSelectedUserIds([]);
      navigate("/chat");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to create group.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // 💡 Disable the submit button if basic validation criteria aren't met
  const isFormInvalid = !groupName.trim() || selectedUserIds.length < 2;

  return (
    <div className="create-group-container">
      <h2>Create New Group Channel</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="groupName">Group Name</label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-control">
          <label>Select Members (Select at least 2)</label>
          <ul className="checkbox-user-list">
            {users.map((user) => (
              <li key={user.id} className="checkbox-user-item">
                <label className="checkbox-label-wrapper">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                    disabled={isSubmitting}
                  />
                  <span>{user.username}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {submitError && <p className="error-banner">{submitError}</p>}

        <div className="form-actions">
          {onCancel && <button type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>}
          <button type="submit" disabled={isSubmitting || isFormInvalid}>
            {isSubmitting ? "Creating..." : "Build Group"}
          </button>
        </div>
      </form>
    </div>
  );
};


export default CreateGroup