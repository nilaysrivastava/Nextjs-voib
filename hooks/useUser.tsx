import { useEffect, useState, createContext, useContext } from 'react';
import {
  useUser as useSupaUser,
  useSessionContext,
  User
} from '@/providers/SupabaseProvider';

import { UserDetails, Subscription } from '@/types';

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsloadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);




  useEffect(() => {
    let active=true;
    setUserDetails(null);setSubscription(null);
    if(!user){setIsloadingData(false);return;}
    setIsloadingData(true);
    Promise.allSettled([supabase.from('users').select('*').eq('id',user.id).maybeSingle(),supabase.from('subscriptions').select('*, prices(*, products(*))').eq('user_id',user.id).in('status',['trialing','active']).gt('current_period_end',new Date().toISOString()).maybeSingle()]).then(results=>{
      if(!active)return;
      if(results[0].status==='fulfilled')setUserDetails(results[0].value.data as UserDetails|null);
      if(results[1].status==='fulfilled')setSubscription(results[1].value.data as Subscription|null);
      setIsloadingData(false);
    });
    return ()=>{active=false;};
  },[user,supabase]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a MyUserContextProvider.`);
  }
  return context;
};