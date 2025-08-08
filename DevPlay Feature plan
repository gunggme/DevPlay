# DevPlay

# DevPlay 세부 기능 명세서 (1차 버전)

## 1. 회원가입 및 로그인

| 기능명 | 설명 | 조건/세부사항 |
| --- | --- | --- |
| OAuth 로그인 | Google, GitHub 계정으로 로그인 | - OAuth 2.0 프로토콜 사용<br>- 로그인 시 최초 가입 여부 확인 |
| 역할 부여 | 로그인 시 기본 ‘일반 유저’로 설정 | - 관리자 승인 시 ‘개발자’ 권한 부여<br>- DB에서 `role` 필드로 관리 |
| 프로필 관리 | 프로필 이미지, 이름, 소개글 변경 | - 기본값: OAuth 제공 데이터<br>- 이미지 파일 업로드 지원 |

---

## 2. 개발자 전용 기능

| 기능명 | 설명 | 조건/세부사항 |
| --- | --- | --- |
| 소프트웨어 등록 | 본인이 개발한 소프트웨어 정보 등록 | - 필수: 이름, 설명, 카테고리, 대표 이미지, URL<br>- 선택: GitHub Repo URL, 태그<br>- 등록 후 수정 가능 |
| 버전 관리 | 소프트웨어 버전별 기록 관리 | - `vX.X.X` 형식 권장<br>- 버전별 설명 필드 지원 |
| 업데이트 로그 작성 | 버전 업데이트 내용 게시 | - 제목, 내용, 첨부 이미지/동영상<br>- 자동으로 해당 소프트웨어 페이지에 표시 |
| 소프트웨어 삭제 | 더 이상 서비스하지 않는 소프트웨어 삭제 | - 삭제 시 기존 게시물/업데이트 로그 유지 여부 옵션 제공 |

---

## 3. 소통 스레드

| 기능명 | 설명 | 조건/세부사항 |
| --- | --- | --- |
| 글 작성 | 소프트웨어 관련 소식/일반 개발 관련 글 작성 | - 최대 500자 제한<br>- 이미지/동영상 첨부 가능 |
| 댓글 | 글에 대한 댓글 작성 | - 최대 300자 제한<br>- 대댓글 가능 |
| 반응 | 글에 대한 이모지/버튼 반응 | - 기본 제공: 좋아요, 응원, 버그신고, 제안<br>- 개발자가 반응 통계 확인 가능 |
| 정렬 | 인기순/최신순 보기 | - 인기순: 반응 수+댓글 수 기준<br>- 최신순: 작성일 기준 |

---

## 4. 탐색 및 피드

| 기능명 | 설명 | 조건/세부사항 |
| --- | --- | --- |
| 메인 피드 | 팔로우한 개발자/소프트웨어 게시물 표시 | - 최신순 기본 정렬<br>- 반응, 댓글 바로 가능 |
| 소프트웨어 탐색 | 모든 등록된 소프트웨어 검색/필터링 | - 카테고리별, 태그별 필터<br>- 인기순/최신순 정렬 |
| 개발자 프로필 | 개발자 정보와 등록한 소프트웨어 확인 | - 팔로우 기능 제공<br>- 해당 개발자 작성 스레드 확인 가능 |

---

## 5. 팔로우 및 알림

| 기능명 | 설명 | 조건/세부사항 |
| --- | --- | --- |
| 개발자 팔로우 | 관심 있는 개발자 팔로우 | - 팔로우 시 해당 개발자 게시물 피드에 표시 |
| 소프트웨어 팔로우 | 특정 소프트웨어 업데이트 알림 | - 팔로우 시 업데이트 로그 피드에 표시 |
| 알림 | 댓글, 반응, 팔로우, 업데이트 알림 | - 실시간 알림(웹소켓 기반)<br>- 알림센터에서 확인 가능 |

---

## 6. 관리자 기능

| 기능명 | 설명 | 조건/세부사항 |
| --- | --- | --- |
| 역할 변경 | 유저 → 개발자 권한 부여 | - 신청자 목록 확인 후 승인/거절 |
| 신고 관리 | 댓글/게시물 신고 처리 | - 신고 사유 확인 후 삭제/차단 |
| 소프트웨어 관리 | 불법/부적절한 소프트웨어 삭제 | - 삭제 시 유저에게 사유 알림 |

---

## 7. DB 주요 구조(초안)

**users**

```sql
id (PK)
oauth_id
name
profile_image
role (user, developer)
created_at
updated_at
```

**softwares**

```jsx
id (PK)
developer_id (FK → users.id)
name
description
category
tags
image_url
download_url
github_url
created_at
updated_at
```

**software_versions**

```sql
id (PK)
software_id (FK → softwares.id)
version
changelog
created_at
```

**threads**

```sql
id (PK)
author_id (FK → users.id)
software_id (nullable, FK → softwares.id)
content
media_url
created_at
updated_at
```

**comments**

```sql
id (PK)
thread_id (FK → threads.id)
author_id (FK → users.id)
content
parent_id (nullable, FK → comments.id)
created_at
```

**reactions**

```sql
id (PK)
thread_id (FK → threads.id)
user_id (FK → users.id)
type (like, cheer, bug, suggestion)
created_at
```

---

## 8. 향후 확장 포인트

- GitHub 릴리스 API 연동으로 자동 changelog 작성
- Markdown 지원(개발자 친화적 글 작성 가능)
- 소프트웨어 다운로드 통계 대시보드
- 다국어 지원
