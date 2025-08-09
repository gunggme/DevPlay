import React, { useState } from 'react';
import { useAppDispatch } from '@/store';
import { setProfile } from '../model/authSlice';
import { supabase } from '@/shared/lib/supabase';

interface NicknameModalProps {
  isOpen: boolean;
  userId: string;
}

export function NicknameModal({ isOpen, userId }: NicknameModalProps) {
  const dispatch = useAppDispatch();
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
      setError('닉네임은 2자 이상 20자 이하로 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 닉네임 중복 체크
      console.log('Checking nickname availability:', nickname);
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', nickname)
        .maybeSingle(); // single() 대신 maybeSingle() 사용

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking nickname:', checkError);
        throw checkError;
      }

      if (existingProfile) {
        setError('이미 사용 중인 닉네임입니다');
        setIsLoading(false);
        return;
      }

      // 프로필 생성
      console.log('Creating profile for user:', userId);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          username: nickname,
          role: 'user',
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        if (profileError.code === '42P01') {
          setError('프로필 테이블이 존재하지 않습니다. 데이터베이스를 초기화해주세요.');
        } else if (profileError.code === '23505') {
          setError('이미 프로필이 존재합니다.');
        } else {
          setError(`프로필 생성 실패: ${profileError.message}`);
        }
        throw profileError;
      }

      if (profile) {
        console.log('✅ Profile created successfully:', {
          id: profile.id,
          user_id: profile.user_id,
          username: profile.username,
          role: profile.role,
          fullProfile: profile
        });
        dispatch(setProfile(profile));
        console.log('✅ Profile dispatched to Redux');
      }
    } catch (err: any) {
      console.error('Nickname modal error:', err);
      if (!error) {
        setError(err.message || '닉네임 설정 중 오류가 발생했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md">
        <div className="rounded-lg border border-border bg-card p-6 shadow-xl">
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold text-card-foreground">
              환영합니다! 🎉
            </h2>
            <p className="text-muted-foreground">
              DevPlay에서 사용할 닉네임을 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="mb-2 block text-sm font-medium text-foreground">
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="2-20자 사이로 입력해주세요"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
                autoFocus
                required
              />
              {error && (
                <p className="mt-2 text-sm text-destructive">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? '설정 중...' : '시작하기'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              닉네임은 나중에 프로필 설정에서 변경할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}