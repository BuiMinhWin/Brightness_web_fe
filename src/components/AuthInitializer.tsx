import React, { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { loadAuthFromStorage } from "../store/slices/authSlice";

const AuthInitializer: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Try to load auth state from localStorage on app initialization
    dispatch(loadAuthFromStorage());
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default AuthInitializer;
