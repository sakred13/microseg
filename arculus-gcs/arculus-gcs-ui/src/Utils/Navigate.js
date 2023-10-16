import { useNavigate } from "react-router-dom";

// Custom React Hook function
const useManageUsersClick = () => {
  const navigate = useNavigate();
  const handleManageUsersClick = () => {
    navigate('/manageUsers');
  };
  return handleManageUsersClick;
};

export default useManageUsersClick;
