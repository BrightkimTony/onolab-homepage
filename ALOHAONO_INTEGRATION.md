# Aloha Ono Integration

Last updated: 2026-07-04

## Public Paths

알로하오노는 오노랩 메인과 분리해 별도 서브도메인으로 운영한다.

- 목표 URL: `https://alohaono.onolab.kr`
- GitHub repo: `https://github.com/BrightkimTony/alohaono-homepage`
- Pages source: `main` branch root
- DNS 필요 작업: Hosting.kr에서 `alohaono` CNAME -> `BrightkimTony.github.io`

기존 오노랩 하위 경로는 DNS 전환 전 레거시 보호용으로 보관한다.

- `https://onolab.kr/alohaono/home/`
- `https://onolab.kr/alohaono/reservation/`

광고 랜딩은 독립 사이트에서 아래 주소를 우선 사용한다.

- `https://alohaono.onolab.kr/reservation/`

## Files

- `alohaono/index.html`: `/alohaono/home/`으로 이동
- `alohaono/home/index.html`: 알로하오노 일반 홈페이지
- `alohaono/reservation/index.html`: 메뉴판 + 예약 연결 랜딩
- `alohaono/styles.css`: 알로하오노 전용 스타일
- `alohaono/script.js`: 언어 전환과 외부 링크 관리
- `alohaono/assets/alohaono-menu-may.pdf`: 메뉴판 PDF

폰트는 알로하오노 폴더 안에 따로 복사하지 않는다. `alohaono/styles.css`에서 오노랩 공통 폰트 경로인 `../assets/fonts/`를 참조한다.

## Onolab Main Page

오노랩 메인 `index.html`에서는 Aloha Ono 파트너 카드와 상단 `제휴` 메뉴를 제거했다.

## Detach Plan

나중에 레거시 경로까지 완전히 제거하려면:

1. `alohaono.onolab.kr` DNS와 HTTPS가 정상 동작하는지 확인한다.
2. 광고/외부 링크가 모두 새 서브도메인을 쓰는지 확인한다.
3. `alohaono/` 폴더를 제거하거나, 일정 기간 `/alohaono/*` -> 새 서브도메인 안내/리다이렉트만 유지한다.
4. 커밋 후 배포한다.

## Source Project

독립 작업 원본은 아래에 남아 있다.

```text
/Users/kgm/.codex/alohaono-homepage
```

오노랩에 배포되는 실제 파일은 아래 경로다.

```text
/Users/kgm/.codex/onolab-homepage/alohaono
```
