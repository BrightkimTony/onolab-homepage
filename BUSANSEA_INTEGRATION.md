# Busan Sea Integration

Last updated: 2026-07-04

## Public URL

Google Play용 `부산바다 지금` 웹앱은 오노랩 메인과 분리한 독립 GitHub Pages repo에서 운영한다.

- 목표 URL: `https://busansea.onolab.kr/`
- DNS 필요 작업: Hosting.kr에서 `busansea` CNAME -> `BrightkimTony.github.io`
- 레거시 경로: `https://onolab.kr/busansea/`

## Source Project

원본 프로젝트는 아래 경로다.

```text
/Users/kgm/AppsInToss/today-busan-sea
```

## Standalone Pages Repo

서브도메인용 정적 배포 repo:

```text
/Users/kgm/.codex/busansea-homepage
https://github.com/BrightkimTony/busansea-homepage
```

GitHub Pages 설정:

```text
Source: main branch /
CNAME: busansea.onolab.kr
```

## Deploy Flow

원본 프로젝트에서 서브도메인 루트용 정적 빌드를 만든다.

```sh
cd /Users/kgm/AppsInToss/today-busan-sea
npm run google-play:web-build
```

생성된 `dist-google-play/` 내용을 독립 repo 루트에 복사한다.

```sh
rsync -a --delete dist-google-play/ /Users/kgm/.codex/busansea-homepage/
printf 'busansea.onolab.kr\n' > /Users/kgm/.codex/busansea-homepage/CNAME
touch /Users/kgm/.codex/busansea-homepage/.nojekyll
```

## Android WebView URL

서브도메인 전환 후 Android 래퍼는 아래 URL을 로드한다.

```text
https://busansea.onolab.kr/
```

설정 위치:

```text
/Users/kgm/AppsInToss/today-busan-sea/platforms/google-play/android/app/src/main/res/values/strings.xml
```

## Legacy Path

`/Users/kgm/.codex/onolab-homepage/busansea/`는 DNS/HTTPS 전환 전 보호용 레거시 경로로 남겨둔다.
