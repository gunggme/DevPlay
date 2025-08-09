const { test, expect } = require('@playwright/test');

// 수정된 기능들에 대한 재테스트
test.describe('DevPlay 수정된 기능 재테스트', () => {
  const BASE_URL = 'http://localhost:5175';

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test.describe('로그인 모달 닫기 기능 수정 재테스트', () => {
    test('X 버튼으로 모달 닫기 (data-testid="close-modal-button")', async ({ page }) => {
      // 로그인 버튼 클릭으로 모달 열기
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();

      // X 버튼으로 모달 닫기
      await page.click('[data-testid="close-modal-button"]');
      await expect(page.locator('[data-testid="login-modal"]')).not.toBeVisible();
    });

    test('모달 외부 클릭으로 닫기 (handleBackdropClick)', async ({ page }) => {
      // 로그인 버튼 클릭으로 모달 열기
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();

      // 모달 외부(배경) 클릭으로 닫기
      await page.click('[data-testid="modal-backdrop"]');
      await expect(page.locator('[data-testid="login-modal"]')).not.toBeVisible();
    });

    test('ESC 키로 모달 닫기', async ({ page }) => {
      // 로그인 버튼 클릭으로 모달 열기
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();

      // ESC 키로 모달 닫기
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="login-modal"]')).not.toBeVisible();
    });
  });

  test.describe('고유 선택자를 사용한 페이지 라우팅 재테스트', () => {
    test('헤더 네비게이션 - 소프트웨어 페이지', async ({ page }) => {
      await page.click('[data-testid="header-software-link"]');
      await expect(page).toHaveURL(`${BASE_URL}/software`);
    });

    test('헤더 네비게이션 - 스레드 페이지', async ({ page }) => {
      await page.click('[data-testid="header-thread-link"]');
      await expect(page).toHaveURL(`${BASE_URL}/thread`);
    });

    test('푸터 링크 - 소프트웨어 페이지', async ({ page }) => {
      await page.click('[data-testid="footer-software-link"]');
      await expect(page).toHaveURL(`${BASE_URL}/software`);
    });

    test('CTA 버튼 - 소프트웨어 둘러보기', async ({ page }) => {
      await page.click('[data-testid="cta-software-button"]');
      await expect(page).toHaveURL(`${BASE_URL}/software`);
    });
  });

  test.describe('네비게이션 기능 재테스트', () => {
    test('헤더 네비게이션 요소들 확인', async ({ page }) => {
      // 헤더의 모든 링크들이 고유 선택자로 식별되는지 확인
      await expect(page.locator('[data-testid="header-software-link"]')).toBeVisible();
      await expect(page.locator('[data-testid="header-thread-link"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    });

    test('푸터 링크들 확인', async ({ page }) => {
      // 푸터의 링크들이 고유 선택자로 식별되는지 확인
      await expect(page.locator('[data-testid="footer-software-link"]')).toBeVisible();
      await expect(page.locator('[data-testid="footer-thread-link"]')).toBeVisible();
    });

    test('CTA 버튼들 확인', async ({ page }) => {
      // CTA 버튼들이 고유 선택자로 식별되는지 확인
      await expect(page.locator('[data-testid="cta-software-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="cta-start-button"]')).toBeVisible();
    });
  });

  test.describe('키보드 접근성 재테스트', () => {
    test('Tab 키로 네비게이션 - 여전히 작동하는지 확인', async ({ page }) => {
      // Tab 키로 포커스 이동 테스트
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('Enter 키로 링크 활성화 - 고유 선택자로', async ({ page }) => {
      // 헤더 소프트웨어 링크에 포커스 후 Enter 키 테스트
      await page.focus('[data-testid="header-software-link"]');
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(`${BASE_URL}/software`);
    });

    test('ESC 키 모달 닫기 - 재확인', async ({ page }) => {
      // 로그인 버튼으로 모달 열기
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();

      // ESC 키로 모달 닫기
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="login-modal"]')).not.toBeVisible();
    });
  });

  test.describe('추가 검증 - 중복 선택자 문제 해결 확인', () => {
    test('동일한 텍스트를 가진 링크들이 고유하게 식별되는지 확인', async ({ page }) => {
      // '소프트웨어' 텍스트를 가진 요소들이 각각 다른 선택자로 식별되는지 확인
      const headerLink = page.locator('[data-testid="header-software-link"]');
      const footerLink = page.locator('[data-testid="footer-software-link"]');
      const ctaButton = page.locator('[data-testid="cta-software-button"]');

      await expect(headerLink).toHaveCount(1);
      await expect(footerLink).toHaveCount(1);
      await expect(ctaButton).toHaveCount(1);

      // 각 요소가 서로 다른 위치에 있는지 확인
      const headerBox = await headerLink.boundingBox();
      const footerBox = await footerLink.boundingBox();
      const ctaBox = await ctaButton.boundingBox();

      expect(headerBox.y).not.toBe(footerBox.y);
      expect(headerBox.y).not.toBe(ctaBox.y);
      expect(footerBox.y).not.toBe(ctaBox.y);
    });
  });
});