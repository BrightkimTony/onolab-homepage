# Onolab Homepage Project Memory

Last updated: 2026-06-24

## Start Here

다음 세션에서 이어갈 때는 아래처럼 요청하면 된다.

```text
/Users/kgm/.codex/onolab-homepage/PROJECT_MEMORY.md 읽고 오노랩 홈페이지 이어서 해줘
```

## Project

- 프로젝트명: 오노랩 홈페이지
- 로컬 경로: `/Users/kgm/.codex/onolab-homepage`
- GitHub 저장소: `https://github.com/BrightkimTony/onolab-homepage`
- 운영 도메인: `https://onolab.kr`
- 알로하오노 하위 페이지:
  - `https://onolab.kr/alohaono/home/`
  - `https://onolab.kr/alohaono/reservation/`
- 이전 GitHub Pages URL: `https://brightkimtony.github.io/onolab-homepage/`
- 배포 방식: GitHub Pages, `main` 브랜치 루트(`/`)
- 커스텀 도메인 파일: `CNAME`

## Current Deployment State

- 도메인: `onolab.kr`
- 구매처/DNS: Hosting.kr 기본 네임서버
- DNS 레코드:
  - `A @ 185.199.108.153`
  - `A @ 185.199.109.153`
  - `A @ 185.199.110.153`
  - `A @ 185.199.111.153`
  - `CNAME www brightkimtony.github.io`
- TTL: `180`
- HTTPS: GitHub Pages 인증서 발급 완료, HTTPS 강제 적용 완료
- 확인 완료:
  - `https://onolab.kr` -> `200 OK`
  - `www.onolab.kr` -> `onolab.kr`로 연결

## Files

- `index.html`: 페이지 구조와 문구
- `styles.css`: 전체 디자인, 반응형, 타이포그래피, 이미지 위치
- `script.js`: 스크롤/탭/인터랙션
- `.nojekyll`: GitHub Pages 정적 배포 보조
- `CNAME`: `onolab.kr`
- `assets/`: 이미지, 로고, 폰트
- `assets/fonts/Paperlogy-*.ttf`: Paperlogy 폰트
- `alohaono/`: 알로하오노 제휴 브랜드 정적 페이지
  - `alohaono/home/index.html`: 알로하오노 일반 홈페이지
  - `alohaono/reservation/index.html`: 메뉴판 + 예약 연결 랜딩
  - `alohaono/assets/alohaono-menu-may.pdf`: 알로하오노 메뉴판 PDF

## Main Brand/Copy Direction

오노랩은 단순 콘텐츠 제작사나 SW 개발사가 아니라, 부산 기반 디지털 스튜디오로 표현한다.

핵심 방향:
- 부산의 이야기와 지역의 장면을 제품으로 만든다.
- 콘텐츠, 소프트웨어, 모바일 게임, 커머스 경험을 연결한다.
- 우선 가치: 상생, 협력, 발전
- 지역 크리에이터, 소상공인, 작은 브랜드와 함께 성장하는 방향
- 학생 대상 커리어/포트폴리오 점검은 무상 지원한다고 표현

현재 히어로 문구:

```text
부산의 이야기를 제품으로 만듭니다

오노랩은 지역의 장면을 콘텐츠, 소프트웨어, 모바일 게임, 커머스 경험으로 연결하는
부산 기반 디지털 스튜디오입니다.
```

## References / Services

현재 홈페이지에서 다루는 오노랩 서비스:

1. 오늘 부산 바다
   - 우선 노출
   - 로컬 데이터 서비스
   - 공공 해양 데이터와 현장 제보 기반
2. 반디
   - 데일리 감성 앱
   - 하루 한 번 작은 빛, 문장, 루틴
3. 사주코드
   - 해석형/구조화 콘텐츠 앱
   - 복잡한 사주 정보를 카드와 흐름으로 정리

## Partners

현재 오노랩 홈페이지의 제휴/파트너 섹션:

1. Aloha Ono
   - 광안리 하와이안 레스토랑
   - 오노랩 도메인 하위 경로로 운영
   - 일반 페이지: `/alohaono/home/`
   - 광고/예약 랜딩: `/alohaono/reservation/`
   - 별도 도메인 구매 없이 오노랩 도메인 안에서 운영한다.
   - 나중에 떼려면 `index.html`의 `#partners` 섹션과 `alohaono/` 폴더를 제거하면 된다.

## Contact

모든 문의 CTA는 카카오톡 오픈채팅으로 연결한다.

```text
https://open.kakao.com/o/s4Wowbyi
```

적용 대상:
- 상단 문의
- 히어로 프로젝트 문의
- 상담/Open 영역
- 커뮤니티 문의하기
- 하단 문의 채널

## Business Info

홈페이지 공개 정보:

- 상호: 오노랩
- 대표: 김경민
- 사업자등록번호: `328-25-02549`
- 이메일: `kimgyeongmin@me.com`
- 업태: 정보통신업
- 종목: 미디어콘텐츠창작업, 전자상거래 소매업, 응용 소프트웨어 개발 및 공급업, 모바일 게임 소프트웨어 개발 및 공급업

주의:
- 집주소는 홈페이지에 노출하지 않는다.
- 기업 실명 경력은 직접 노출하지 않는다. 필요한 경우 "그룹사 교육/채용 사업 경험" 정도로 완곡하게 쓴다.

## Design Notes

- 참고 방향:
  - SSGN Museum 같은 인터랙티브한 섹션감
  - Shinsegae 스타일의 큰 섹션, 정제된 포털형 구성
- 색감:
  - 부산/바다 모티브
  - 무채색, 크림, 딥그린, 바다 블루, 금색 포인트
  - 너무 단조로운 단색 팔레트는 피한다.
- 타이포그래피:
  - Paperlogy 사용
  - 제목은 너무 과장하지 않고 크기/행간 조정
  - `word-break: keep-all`
  - 본문은 읽기 길이를 제한하고 행간을 확보
- 이미지:
  - 히어로와 오늘 부산 바다는 광안대교 사진 사용
  - 상세 쇼케이스의 바다 이미지는 대교가 보이도록 `object-position: center bottom`
  - 기존 반디 숲 이미지는 Values 섹션 배경으로 이동

## Update Workflow

일반 수정 절차:

```zsh
cd /Users/kgm/.codex/onolab-homepage
```

수정 후 확인:

```zsh
git status --short
git diff
```

커밋/배포:

```zsh
git add .
git commit -m "Describe homepage update"
git push
```

GitHub Pages는 `main` 브랜치에 push하면 자동 배포된다. 보통 1분 안팎으로 `https://onolab.kr`에 반영된다.

알로하오노 하위 페이지를 수정할 때:

- 경로 기준은 오노랩 프로젝트 안의 `alohaono/` 폴더다.
- 알로하오노 원본 프로젝트는 `/Users/kgm/.codex/alohaono-homepage`에 따로 남아 있다.
- 오노랩에 배포할 버전은 `alohaono/home/`, `alohaono/reservation/` 안의 파일을 기준으로 확인한다.

## Verification Commands

DNS 확인:

```zsh
dig +short onolab.kr A
dig +short www.onolab.kr CNAME
```

접속 확인:

```zsh
curl -I https://onolab.kr
curl -I https://www.onolab.kr
```

GitHub Pages 상태 확인:

```zsh
gh api repos/BrightkimTony/onolab-homepage/pages --jq '{cname: .cname, html_url: .html_url, https_enforced: .https_enforced, certificate: .https_certificate}'
```

## Backend Note

현재 오노랩 홈페이지는 정적 사이트로 충분하다.

`/Users/kgm/AppsInToss/today-busan-sea`의 Supabase Edge Function 백엔드는 오늘 부산 바다의 바다 조건 API와 현장 제보 인박스에 맞춰진 구조다. 오노랩 홈페이지에는 직접 붙이지 않고, 레퍼런스/서비스 소개로만 사용한다.

문의 저장이나 프로젝트 상담 접수가 필요해지면 그때 별도 `contact-leads` 테이블과 Supabase Edge Function을 추가한다.
