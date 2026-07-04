import React from 'react';
import MyAreaFeedScreen from '../features/feed/MyAreaFeedScreen';
import EmptyFeedScreen from '../features/feed/EmptyFeedScreen';
import { useAuthStore } from '../store/useAuthStore';

// HomeScreen reuses the existing MyAreaFeedScreen or EmptyFeedScreen based on user state
const HomeScreen: React.FC = () => {
  const isNewUser = useAuthStore((state) => state.isNewUser);

  if (isNewUser) {
    return <EmptyFeedScreen />;
  }

  return <MyAreaFeedScreen />;
};

export default HomeScreen;
