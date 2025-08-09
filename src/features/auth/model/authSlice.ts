import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/shared/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/shared/types';

// initializeAuth 반환 타입 정의
interface InitializeAuthResult {
  session: Session | null;
  profile: Profile | null;
  user: User | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  error: null,
};

export const initializeAuth = createAsyncThunk<InitializeAuthResult, void>(
  'auth/initialize',
  async (): Promise<InitializeAuthResult> => {
    console.log('🔧 initializeAuth: Starting with session-first approach...');
    
    try {
      // Step 1: getSession() 먼저 호출 (로컬 저장소에서 가져오므로 더 빠르고 안정적)
      console.log('🔍 Step 1: Calling supabase.auth.getSession()...');
      console.time('getSession duration');
      
      const getSessionPromise = supabase.auth.getSession();
      console.log('🔍 Step 1.1: getSession() promise created, awaiting...');
      
      const sessionResult = await getSessionPromise;
      console.timeEnd('getSession duration');
      console.log('🔍 Step 1.2: getSession() completed');
      
      const { data: { session }, error: sessionError } = sessionResult;
      
      console.log('🔍 Step 2: Session check result:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        sessionError: sessionError?.message,
        sessionErrorCode: sessionError?.code,
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'
      });
      
      if (sessionError) {
        console.error('❌ Step 2.1: Session error detected:', sessionError);
        throw sessionError;
      }
      
      if (session?.user) {
        const user = session.user;
        console.log('✅ Step 3: Valid session found, preparing to fetch profile for:', user.id);
        
        // Step 4: Profile 조회 (timeout 추가)
        console.log('🔍 Step 4: About to query profiles table...');
        console.time('profile query duration');
        
        // 10초 timeout 추가
        const profileQueryPromise = supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile query timeout after 10s')), 10000);
        });
        
        console.log('🔍 Step 4.1: Profile query created, awaiting with timeout...');
        
        const profileResult = await Promise.race([profileQueryPromise, timeoutPromise]) as any;
        console.timeEnd('profile query duration');
        console.log('🔍 Step 4.2: Profile query completed');
        
        const { data: profile, error: profileError } = profileResult;
        
        console.log('📋 Step 5: Profile query result:', { 
          hasProfile: !!profile, 
          username: profile?.username,
          profileData: profile,
          profileError: profileError?.message,
          profileErrorCode: profileError?.code 
        });
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('❌ Step 5.1: Profile fetch error (non-404):', profileError);
        }
        
        const result = { session, profile, user };
        console.log('✅ Step 6: Preparing to return result:', { 
          hasSession: !!result.session, 
          hasProfile: !!result.profile,
          hasUser: !!result.user,
          username: result.profile?.username 
        });
        
        return result;
      }
      
      console.log('🔒 Step 7: No session found, returning empty result');
      return { session: null, profile: null, user: null };
    } catch (error) {
      console.error('❌ initializeAuth: Unexpected error at step:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }
);

export const signInWithProvider = createAsyncThunk<any, 'google' | 'github'>(
  'auth/signInWithProvider',
  async (provider: 'google' | 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  }
);

export const signOut = createAsyncThunk<void, void>(
  'auth/signOut',
  async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
);

export const updateProfile = createAsyncThunk<Profile, Partial<Profile>>(
  'auth/updateProfile',
  async (updates: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    return data;
  }
);

export const refreshProfile = createAsyncThunk<Profile | null, void>(
  'auth/refreshProfile',
  async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      throw error;
    }
    return data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      console.log('🔄 Redux: setSession called with:', {
        hasSession: !!action.payload,
        userId: action.payload?.user?.id
      });
      state.session = action.payload;
      // setSession에서는 session의 user만 사용 (기존 user 상태 유지하지 않음)
      state.user = action.payload?.user || null;
    },
    setProfile: (state, action: PayloadAction<Profile | null>) => {
      console.log('🔄 Redux: setProfile called with:', {
        hasProfile: !!action.payload,
        username: action.payload?.username
      });
      state.profile = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action: PayloadAction<InitializeAuthResult>) => {
        console.log('🔄 Redux: initializeAuth fulfilled with payload:', {
          hasSession: !!action.payload.session,
          hasProfile: !!action.payload.profile,
          hasUser: !!action.payload.user,
          sessionUserId: action.payload.session?.user?.id,
          payloadUserId: action.payload.user?.id,
          username: action.payload.profile?.username
        });
        state.session = action.payload.session;
        // user는 payload.user를 우선하되, 없으면 session의 user를 사용
        const user = action.payload.user || action.payload.session?.user || null;
        state.user = user;
        state.profile = action.payload.profile;
        state.isLoading = false;
        state.error = null;
        console.log('✅ Redux: Auth state updated:', {
          hasUser: !!state.user,
          userId: state.user?.id,
          profileUsername: state.profile?.username,
          hasSession: !!state.session
        });
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        console.error('Redux: initializeAuth rejected:', action.error);
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to initialize auth';
      })
      .addCase(signInWithProvider.pending, (state) => {
        state.error = null;
      })
      .addCase(signInWithProvider.rejected, (state, action) => {
        console.error('Redux: signInWithProvider rejected:', action.error);
        state.error = action.error.message ?? 'Failed to sign in';
      })
      .addCase(signOut.pending, (state) => {
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        console.log('Redux: signOut fulfilled');
        state.user = null;
        state.profile = null;
        state.session = null;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        console.error('Redux: signOut rejected:', action.error);
        state.error = action.error.message ?? 'Failed to sign out';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        console.log('Redux: updateProfile fulfilled');
        state.profile = action.payload;
      })
      .addCase(refreshProfile.fulfilled, (state, action) => {
        console.log('Redux: refreshProfile fulfilled');
        state.profile = action.payload;
      });
  },
});

export const { setSession, setProfile, clearError } = authSlice.actions;
export default authSlice.reducer;