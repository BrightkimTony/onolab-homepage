# Aloha Ono Integration

Last updated: 2026-06-25

## Public Paths

오노랩 도메인 안에서 알로하오노를 운영한다.

- `https://onolab.kr/alohaono/home/`
- `https://onolab.kr/alohaono/reservation/`

광고 랜딩은 아래 주소를 우선 사용한다.

- `https://onolab.kr/alohaono/reservation/`

## Files

- `alohaono/index.html`: `/alohaono/home/`으로 이동
- `alohaono/home/index.html`: 알로하오노 일반 홈페이지
- `alohaono/reservation/index.html`: 메뉴판 + 예약 연결 랜딩
- `alohaono/styles.css`: 알로하오노 전용 스타일
- `alohaono/script.js`: 언어 전환과 외부 링크 관리
- `alohaono/assets/alohaono-menu-may.pdf`: 메뉴판 PDF

## Onolab Main Page

오노랩 메인 `index.html`에는 `#partners` 섹션이 추가되어 있다.

- 섹션명: `Partners`
- 카드명: `Aloha Ono`
- 링크: `./alohaono/home/`

## Detach Plan

나중에 알로하오노를 오노랩에서 빼려면:

1. `index.html`에서 `#partners` 섹션의 `Aloha Ono` 카드를 제거한다.
2. 상단 메뉴의 `제휴` 링크가 필요 없으면 제거한다.
3. `alohaono/` 폴더를 제거한다.
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
