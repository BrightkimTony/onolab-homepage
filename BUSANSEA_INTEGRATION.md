# Busan Sea Integration

Last updated: 2026-07-03

## Public Path

Google Play용 `부산바다 지금` 웹앱을 오노랩 GitHub Pages 하위 경로에서 운영한다.

- `https://onolab.kr/busansea/`

## Source Project

원본 프로젝트는 아래 경로다.

```text
/Users/kgm/AppsInToss/today-busan-sea
```

## Deploy Flow

원본 프로젝트에서 Google Play용 정적 빌드를 만든다.

```sh
cd /Users/kgm/AppsInToss/today-busan-sea
npm run google-play:web-build:onolab
```

생성된 `dist-google-play/` 내용을 이 repo의 `busansea/` 폴더에 복사한다.

```sh
rsync -a --delete dist-google-play/ /Users/kgm/.codex/onolab-homepage/busansea/
```

## Android WebView URL

Android 래퍼는 아래 URL을 로드한다.

```text
https://onolab.kr/busansea/
```

설정 위치:

```text
/Users/kgm/AppsInToss/today-busan-sea/platforms/google-play/android/app/src/main/res/values/strings.xml
```

## Future Subdomain Option

나중에 Hosting.kr DNS에서 `busansea.onolab.kr` CNAME을 설정하면 서브도메인으로 분리할 수 있다. 그때는 Vite base path와 Android `web_app_url`을 함께 바꾼다.
