import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5175';

test.describe('DevPlay QA Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto(BASE_URL);
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
  });

  test.describe('홈페이지 UI/UX 테스트', () => {
    test('홈페이지 로딩 및 기본 레이아웃 확인', async ({ page }) => {
      // 페이지 타이틀 확인
      await expect(page).toHaveTitle(/DevPlay/);
      
      // Hero section 확인
      await expect(page.locator('h1')).toContainText('개발자와 사용자를');
      await expect(page.locator('h1')).toContainText('연결');
      await expect(page.locator('h1')).toContainText('하는 플랫폼');
      
      // 서브 타이틀 확인
      await expect(page.getByText('소프트웨어를 공유하고, 피드백을 받고, 커뮤니티와 소통하세요.')).toBeVisible();
      
      // CTA 버튼들 확인
      await expect(page.getByRole('link', { name: '소프트웨어 둘러보기' })).toBeVisible();
      await expect(page.getByRole('link', { name: '커뮤니티 참여하기' })).toBeVisible();
    });

    test('헤더 네비게이션 확인', async ({ page }) => {
      // 로고 확인
      await expect(page.getByText('DevPlay')).toBeVisible();
      
      // 네비게이션 메뉴 확인
      await expect(page.getByRole('link', { name: '홈' })).toBeVisible();
      await expect(page.getByRole('link', { name: '소프트웨어' })).toBeVisible();
      await expect(page.getByRole('link', { name: '스레드' })).toBeVisible();
      
      // 로그인 버튼 확인
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });

    test('기능 소개 섹션 확인', async ({ page }) => {
      // 기능 카드들 확인
      await expect(page.getByText('소프트웨어 공유')).toBeVisible();
      await expect(page.getByText('실시간 피드백')).toBeVisible();
      await expect(page.getByText('커뮤니티')).toBeVisible();
      
      // 기능 설명 확인
      await expect(page.getByText('개발한 소프트웨어를 쉽게 배포하고 버전 관리하세요.')).toBeVisible();
      await expect(page.getByText('사용자들과 실시간으로 소통하고 피드백을 주고받으세요.')).toBeVisible();
      await expect(page.getByText('개발자들과 네트워크를 형성하고 협업의 기회를 만드세요.')).toBeVisible();
    });

    test('CTA 섹션 확인 (비로그인 상태)', async ({ page }) => {
      // CTA 섹션이 표시되는지 확인
      await expect(page.getByText('지금 시작하세요')).toBeVisible();
      await expect(page.getByText('DevPlay에 가입하고 개발자 커뮤니티의 일원이 되어보세요.')).toBeVisible();
      await expect(page.getByRole('button', { name: '무료로 시작하기' })).toBeVisible();
    });
  });

  test.describe('로그인 모달 테스트', () => {
    test('로그인 모달 열기/닫기', async ({ page }) => {
      // 로그인 버튼 클릭
      await page.getByRole('button', { name: '로그인' }).click();
      
      // 모달 표시 확인
      await expect(page.getByText('DevPlay에 로그인')).toBeVisible();
      
      // OAuth 버튼들 확인
      await expect(page.getByRole('button', { name: 'Google로 계속하기' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'GitHub로 계속하기' })).toBeVisible();
      
      // 약관 링크 확인
      await expect(page.getByText('이용약관')).toBeVisible();
      await expect(page.getByText('개인정보 처리방침')).toBeVisible();
      
      // 모달 닫기 (X 버튼)
      await page.locator('button').filter({ hasText: '✕' }).click();
      
      // 모달이 사라졌는지 확인
      await expect(page.getByText('DevPlay에 로그인')).not.toBeVisible();
    });

    test('모달 외부 클릭으로 닫기', async ({ page }) => {
      // 로그인 버튼 클릭
      await page.getByRole('button', { name: '로그인' }).click();
      
      // 모달 표시 확인
      await expect(page.getByText('DevPlay에 로그인')).toBeVisible();
      
      // 모달 외부 클릭 (배경 클릭)
      await page.locator('.fixed.inset-0.z-50.bg-black\\/50').click();
      
      // 모달이 사라졌는지 확인
      await expect(page.getByText('DevPlay에 로그인')).not.toBeVisible();
    });
  });

  test.describe('페이지 라우팅 테스트', () => {
    test('소프트웨어 페이지 라우팅', async ({ page }) => {
      await page.getByRole('link', { name: '소프트웨어' }).click();
      await page.waitForURL('**/software');
      expect(page.url()).toContain('/software');
    });

    test('스레드 페이지 라우팅', async ({ page }) => {
      await page.getByRole('link', { name: '스레드' }).click();
      await page.waitForURL('**/threads');
      expect(page.url()).toContain('/threads');
    });

    test('홈페이지 로고 클릭', async ({ page }) => {
      // 다른 페이지로 이동
      await page.getByRole('link', { name: '소프트웨어' }).click();
      await page.waitForURL('**/software');
      
      // 로고 클릭하여 홈으로 이동
      await page.getByText('DevPlay').first().click();
      await page.waitForURL(BASE_URL);
      expect(page.url()).toBe(BASE_URL + '/');
    });

    test('CTA 버튼 라우팅', async ({ page }) => {
      // '소프트웨어 둘러보기' 버튼 클릭
      await page.getByRole('link', { name: '소프트웨어 둘러보기' }).click();
      await page.waitForURL('**/software');
      expect(page.url()).toContain('/software');
      
      // 홈으로 돌아가기
      await page.goto(BASE_URL);
      
      // '커뮤니티 참여하기' 버튼 클릭
      await page.getByRole('link', { name: '커뮤니티 참여하기' }).click();
      await page.waitForURL('**/threads');
      expect(page.url()).toContain('/threads');
    });

    test('브라우저 뒤로가기/앞으로가기', async ({ page }) => {
      // 소프트웨어 페이지로 이동
      await page.getByRole('link', { name: '소프트웨어' }).click();
      await page.waitForURL('**/software');
      
      // 스레드 페이지로 이동
      await page.getByRole('link', { name: '스레드' }).click();
      await page.waitForURL('**/threads');
      
      // 뒤로 가기
      await page.goBack();
      await page.waitForURL('**/software');
      expect(page.url()).toContain('/software');
      
      // 앞으로 가기
      await page.goForward();
      await page.waitForURL('**/threads');
      expect(page.url()).toContain('/threads');
    });

    test('404 페이지 확인', async ({ page }) => {
      await page.goto(`${BASE_URL}/non-existent-page`);
      // NotFoundPage 컴포넌트 확인 (실제 구현에 따라 조정 필요)
      await expect(page.getByText('404')).toBeVisible();
    });
  });

  test.describe('반응형 디자인 테스트', () => {
    test('데스크톱 뷰포트', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      
      // 데스크톱에서 네비게이션 메뉴가 보이는지 확인
      await expect(page.getByRole('link', { name: '홈' })).toBeVisible();
      await expect(page.getByRole('link', { name: '소프트웨어' })).toBeVisible();
      await expect(page.getByRole('link', { name: '스레드' })).toBeVisible();
    });

    test('태블릿 뷰포트', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      
      // 기본 레이아웃이 여전히 작동하는지 확인
      await expect(page.getByText('DevPlay')).toBeVisible();
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });

    test('모바일 뷰포트', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      
      // 모바일에서 데스크톱 네비게이션이 숨겨지는지 확인
      const navigation = page.locator('nav.hidden.md\\:flex');
      await expect(navigation).not.toBeVisible();
      
      // 기본 요소들은 여전히 표시되는지 확인
      await expect(page.getByText('DevPlay')).toBeVisible();
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });
  });

  test.describe('키보드 네비게이션 및 접근성', () => {
    test('Tab 키로 네비게이션', async ({ page }) => {
      // Tab 키로 포커스 이동
      await page.keyboard.press('Tab'); // DevPlay 로고
      await page.keyboard.press('Tab'); // 홈 링크
      await page.keyboard.press('Tab'); // 소프트웨어 링크
      await page.keyboard.press('Tab'); // 스레드 링크
      await page.keyboard.press('Tab'); // 로그인 버튼
      
      // 마지막 포커스된 요소가 로그인 버튼인지 확인
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toContainText('로그인');
    });

    test('Enter 키로 링크 활성화', async ({ page }) => {
      // 소프트웨어 링크에 포커스
      await page.getByRole('link', { name: '소프트웨어' }).focus();
      
      // Enter 키 누르기
      await page.keyboard.press('Enter');
      
      // 페이지 이동 확인
      await page.waitForURL('**/software');
      expect(page.url()).toContain('/software');
    });

    test('Escape 키로 모달 닫기', async ({ page }) => {
      // 로그인 모달 열기
      await page.getByRole('button', { name: '로그인' }).click();
      await expect(page.getByText('DevPlay에 로그인')).toBeVisible();
      
      // Escape 키로 모달 닫기
      await page.keyboard.press('Escape');
      
      // 모달이 닫혔는지 확인
      await expect(page.getByText('DevPlay에 로그인')).not.toBeVisible();
    });
  });

  test.describe('성능 테스트', () => {
    test('페이지 로딩 시간', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      console.log(`페이지 로딩 시간: ${loadTime}ms`);
      
      // 3초 이내에 로드되어야 함
      expect(loadTime).toBeLessThan(3000);
    });

    test('이미지 로딩 확인', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // 모든 이미지가 로드되었는지 확인
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        await expect(image).not.toHaveAttribute('src', '');
      }
    });
  });
});