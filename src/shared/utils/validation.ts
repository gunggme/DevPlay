export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): string | null => {
  if (!username) return '사용자명을 입력해주세요.';
  if (username.length < 2) return '사용자명은 2자 이상이어야 합니다.';
  if (username.length > 20) return '사용자명은 20자 이하여야 합니다.';
  if (!/^[a-zA-Z0-9_가-힣]+$/.test(username)) {
    return '사용자명은 영문, 숫자, 언더스코어(_), 한글만 사용 가능합니다.';
  }
  return null;
};

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('비밀번호를 입력해주세요.');
    return errors;
  }
  
  if (password.length < 8) {
    errors.push('비밀번호는 8자 이상이어야 합니다.');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('대문자를 포함해야 합니다.');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('소문자를 포함해야 합니다.');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 포함해야 합니다.');
  }
  
  return errors;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateRequired = (value: unknown, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName}을(를) 입력해주세요.`;
  }
  return null;
};

export const validateLength = (
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): string | null => {
  if (!value) return null;
  
  if (value.length < min) {
    return `${fieldName}은(는) ${min}자 이상이어야 합니다.`;
  }
  
  if (value.length > max) {
    return `${fieldName}은(는) ${max}자 이하여야 합니다.`;
  }
  
  return null;
};