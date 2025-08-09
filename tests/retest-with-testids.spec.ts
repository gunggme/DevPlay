import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5175';

test.describe('DevPlay 수정된 기능 재테스트 - 고유 선택자 사용', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test.describe('로그인 모달 닫기 기능 재테스트', () => {
    test('로그인 모달 열기 및 data-testid 확인', async ({ page }) => {
      // 로그인 버튼 클릭 (고유 선택자 사용)
      await page.click('[data-testid="login-button"]');
      
      // 모달이 열렸는지 확인
      await expect(page.getByText('DevPlay에 로그인')).toBeVisible();
      
      // 모달 내용 확인
      await expect(page.getByPlaceholder('이메일을 입력하세요')).toBeVisible();
      await expect(page.getByPlaceholder('비밀번호를 입력하세요')).toBeVisible();
    });

    test('X 버튼으로 모달 닫기 기능 테스트', async ({ page }) => {
      // 로그인 모달 열기
      await page.click('[data-testid="login-button"]');
      await expect(page.getByText('DevPlay에 로그인')).toBeVisible();

      // X 버튼 찾기 및 클릭
      const closeButton = page.locator('button:has-text("✕")').or(
        page.locator('[data-testid="close-modal-button"]')
      ).or(
        page.locator('button[aria-label="Close"]')
      );
      
      await closeButton.click();
      
      // 모달이 닫혔는지 확인
      await expect(page.getByText('DevPlay에 로그인')).not.toBeVisible();
    });

    test('ESC 키로 모달 닫기 기능 테스트', async ({ page }) => {
      // 로그인 모달 열기
      await page.click('[data-testid="login-button"]');
      await expect(page.getByText('DevPlay에 로그인')).toBeVisible();

      // ESC 키 누르기
      await page.keyboard.press('Escape');
      
      // 모달이 닫혔는지 확인
      await expect(page.getByText('DevPlay에 로그인')).not.toBeVisible();
    });

    test('모달 외부 클릭으로 닫기 기능 테스트', async ({ page }) => {
      // 로그인 모달 열기
      await page.click('[data-testid="login-button"]');
      await expect(page.getByText('DevPlay에 로그인')).toBeVisible();

      // 모달 외부 클릭 (배경 클릭)
      await page.click('body', { position: { x: 50, y: 50 } });
      
      // 모달이 닫혔는지 확인
      await expect(page.getByText('DevPlay에 로그인')).not.toBeVisible();
    });
  });

  test.describe('고유 선택자를 사용한 페이지 라우팅 테스트', () => {
    test('헤더 네비게이션 - 소프트웨어 페이지 (data-testid 사용)', async ({ page }) => {
      await page.click('[data-testid="header-software-link"]');
      await expect(page).toHaveURL(`${BASE_URL}/software`);
    });

    test('헤더 네비게이션 - 스레드 페이지 (data-testid 사용)', async ({ page }) => {
      await page.click('[data-testid="header-thread-link"]');
      await expect(page).toHaveURL(`${BASE_URL}/thread`);
    });

    test('CTA 버튼 - 소프트웨어 둘러보기 (data-testid 사용)', async ({ page }) => {
      await page.click('[data-testid="cta-software-button"]');
      await expect(page).toHaveURL(`${BASE_URL}/software`);
    });

    test('푸터 링크 - 소프트웨어 페이지 (data-testid 사용)', async ({ page }) => {
      await page.click('[data-testid="footer-software-link"]');
      await expect(page).toHaveURL(`${BASE_URL}/software`);
    });

    test('푸터 링크 - 스레드 페이지 (data-testid 사용)', async ({ page }) => {
      await page.click('[data-testid="footer-thread-link"]');
      await expect(page).toHaveURL(`${BASE_URL}/thread`);
    });
  });

  test.describe('중복 선택자 문제 해결 확인', () => {
    test('동일한 텍스트 링크들이 고유하게 구별되는지 확인', async ({ page }) => {
      // 각 data-testid로 요소들이 고유하게 식별되는지 확인
      const headerSoftwareLink = page.locator('[data-testid="header-software-link"]');
      const ctaSoftwareButton = page.locator('[data-testid="cta-software-button"]');
      const footerSoftwareLink = page.locator('[data-testid="footer-software-link"]');

      // 각 요소가 정확히 하나씩만 존재하는지 확인
      await expect(headerSoftwareLink).toHaveCount(1);
      await expect(ctaSoftwareButton).toHaveCount(1);
      await expect(footerSoftwareLink).toHaveCount(1);

      // 각 요소가 보이는지 확인
      await expect(headerSoftwareLink).toBeVisible();
      await expect(ctaSoftwareButton).toBeVisible();
      await expect(footerSoftwareLink).toBeVisible();

      // 각 요소가 다른 위치에 있는지 확인 (위치 검증)
      const headerBox = await headerSoftwareLink.boundingBox();
      const ctaBox = await ctaSoftwareButton.boundingBox();
      const footerBox = await footerSoftwareLink.boundingBox();

      expect(headerBox?.y).toBeLessThan(ctaBox?.y || 0);
      expect(ctaBox?.y).toBeLessThan(footerBox?.y || 0);
    });

    test('각 링크가 올바른 기능을 수행하는지 개별 테스트', async ({ page }) => {
      // 헤더 소프트웨어 링크 테스트
      await page.click('[data-testid="header-software-link"]');
      await expect(page).toHaveURL(`${BASE_URL}/software`);
      
      await page.goBack();
      await page.waitForURL(BASE_URL);

      // CTA 소프트웨어 버튼 테스트
      await page.click('[data-testid="cta-software-button"]');
      await expect(page).toHaveURL(`${BASE_URL}/software`);
      
      await page.goBack();
      await page.waitForURL(BASE_URL);

      // 푸터 소프트웨어 링크 테스트
      await page.click('[data-testid="footer-software-link"]');
      await expect(page).toHaveURL(`${BASE_URL}/software`);
    });
  });

  test.describe('키보드 접근성 재테스트', () => {
    test('Tab 키 네비게이션으로 로그인 버튼까지 이동', async ({ page }) => {
      // 첫 번째 포커스 가능한 요소로 이동
      await page.keyboard.press('Tab');
      
      let attempts = 0;
      const maxAttempts = 10;
      
      // 로그인 버튼에 포커스가 올 때까지 Tab 키 반복
      while (attempts < maxAttempts) {
        const focusedElement = page.locator(':focus');
        const testId = await focusedElement.getAttribute('data-testid').catch(() => null);
        
        if (testId === 'login-button') {
          // 로그인 버튼에 포커스가 와 있는지 확인
          await expect(focusedElement).toBeFocused();
          break;
        }
        
        await page.keyboard.press('Tab');
        attempts++;
      }

      // 최대 시도 횟수 내에 로그인 버튼을 찾았는지 확인
      expect(attempts).toBeLessThan(maxAttempts);
    });

    test('Enter 키로 고유 선택자 링크 활성화', async ({ page }) => {
      // 헤더 소프트웨어 링크에 포커스 후 Enter 키
      await page.focus('[data-testid="header-software-link"]');
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(`${BASE_URL}/software`);
    });
  });

  test.describe('성능 및 안정성 검증', () => {
    test('모달 열기/닫기 연속 작업 안정성 테스트', async ({ page }) => {
      // 모달을 여러 번 열고 닫는 과정을 반복해서 메모리 누수나 오류 확인
      for (let i = 0; i < 3; i++) {
        // 모달 열기
        await page.click('[data-testid="login-button"]');
        await expect(page.getByText('DevPlay에 로그인')).toBeVisible();
        
        // ESC로 닫기
        await page.keyboard.press('Escape');
        await expect(page.getByText('DevPlay에 로그인')).not.toBeVisible();
        
        // 잠시 대기
        await page.waitForTimeout(100);
      }
    });

    test('라우팅 연속 작업 안정성 테스트', async ({ page }) => {
      // 각 페이지를 연속으로 방문하여 라우팅 안정성 확인
      const routes = [
        { testid: 'header-software-link', url: '/software' },
        { testid: 'header-thread-link', url: '/thread' }
      ];

      for (const route of routes) {
        await page.click(`[data-testid="${route.testid}"]`);
        await expect(page).toHaveURL(`${BASE_URL}${route.url}`);
        
        // 홈으로 돌아가기
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
      }
    });
  });
});