// 테스트용 스크립트 - 브라우저 콘솔에서 실행
// 먼저 개발자 권한 확인 후 소프트웨어 생성

// 1. 현재 프로필 확인
const getProfile = async () => {
  const response = await fetch('/api/profiles/me', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
    }
  });
  const data = await response.json();
  console.log('Current profile:', data);
  return data;
};

// 2. 소프트웨어 생성 테스트
const createTestSoftware = async () => {
  const testData = {
    name: "DevPlay IDE Extension",
    description: "A powerful IDE extension for developers that enhances productivity with AI-powered code suggestions, real-time collaboration features, and advanced debugging tools.",
    category: "Development Tools",
    tags: ["IDE", "Productivity", "AI", "Collaboration"],
    image_url: "https://picsum.photos/400/300?random=1",
    download_url: "https://github.com/example/devplay-extension/releases",
    github_url: "https://github.com/example/devplay-extension"
  };

  console.log('Creating software with data:', testData);
  
  // API 호출은 실제 앱에서 수행됨
  return testData;
};

// 실행
console.log('=== Software Test Script ===');
console.log('1. Run getProfile() to check your current profile');
console.log('2. Run createTestSoftware() to get test data');
console.log('3. Use the UI to create a software with the test data');