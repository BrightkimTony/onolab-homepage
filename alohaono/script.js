const EXTERNAL_LINKS = {
  google:
    "https://www.google.com/maps/search/?api=1&query=%EC%95%8C%EB%A1%9C%ED%95%98%EC%98%A4%EB%85%B8%20%EA%B4%91%EC%95%88%EB%A6%AC",
  instagram: "https://www.instagram.com/aloha.ono_/",
  naver:
    "https://map.naver.com/p/entry/place/2038053181?lng=129.1142551&lat=35.1466536&placePath=/booking?entry=plt&from=map&fromPanelNum=1&additionalHeight=76&timestamp=202606242049&locale=ko&svcName=map_pcv5&entry=plt&searchType=place&c=15.00,0,0,0,dh",
};

const DEFAULT_LANG = "en";
const LANGUAGE_STORAGE_KEY = "alohaono-language";

const translations = {
  en: {
    navHome: "Home",
    navMenu: "Menu",
    navView: "View",
    navReserve: "Reserve",
    navLinks: "Links",
    heroEyebrow: "Hawaiian Restaurant · Gwangalli",
    heroTitle: "Aloha means hello. Ono means delicious.",
    heroCopy:
      "Aloha Ono serves Hawaiian-inspired food with a Gwangalli ocean view, bringing a warm island greeting and a delicious table to Busan.",
    heroReserve: "Make a reservation",
    heroExplore: "Explore the table",
    cardLabel: "Today at Aloha Ono",
    cardTitle: "Hawaiian food by the sea",
    cardCopy: "Island mood, colorful plates, and a Gwangalli view come together at one table.",
    introTitle: "A greeting that becomes a delicious meal.",
    introCopy:
      "The name joins Aloha, Hawaii's warm greeting, with Ono, the Hawaiian word for delicious. Aloha Ono is a Hawaiian restaurant that serves that meaning through food, color, and a relaxed ocean-side mood.",
    menuTitle: "Hawaiian plates made bright, fresh, and satisfying.",
    menuOneTitle: "Acai Bowl",
    menuOneCopy: "Fruit, granola, and a vivid tropical tone that brings Hawaii's color to the table.",
    menuTwoTitle: "Hawaiian Brunch",
    menuTwoCopy: "A generous plate for late mornings, ocean light, and easy conversations.",
    menuThreeTitle: "Fresh Island Salad",
    menuThreeCopy: "Clean greens, savory protein, and a fresh island-style balance.",
    viewTitle: "Hawaiian food with the Gwangalli view.",
    viewCopy:
      "Aloha Ono brings Hawaii's easygoing table culture to Gwangalli: sea, bridge, sunlight, and food made to feel delicious and welcoming.",
    viewPointOne: "Hawaiian food",
    viewPointTwo: "Ocean-view table",
    viewPointThree: "Gwangalli visit",
    homeReserveTitle: "Ready for a Hawaiian table in Gwangalli?",
    homeReserveCopy:
      "Open the reservation page to check the menu board first, then continue through Google, Instagram, or Naver booking.",
    reservationEyebrow: "Menu first · Reservation next",
    reservationTitle: "Check the Hawaiian menu, then reserve your table.",
    reservationCopy:
      "Review the Aloha Ono menu board first. When you are ready, continue through Google, Instagram, or Naver booking.",
    menuBoardTitle: "Aloha Ono menu board",
    menuBoardCopy:
      "Open the menu in the page, or download the PDF if your browser does not display it clearly.",
    downloadMenu: "Open menu PDF",
    reserveTitle: "Plan your Aloha Ono visit.",
    reserveCopy:
      "This page does not collect reservation data. Continue through the official channels below, with Naver booking as the direct reservation route.",
    googleReserveCopy: "Check directions and store details.",
    instagramReserveCopy: "See the latest photos and message the shop.",
    naverReserveCopy: "Reserve through Naver booking.",
    linksTitle: "Continue from search to visit.",
    googleCopy: "Map search and route check",
    instagramCopy: "Photos, mood, and updates",
    naverCopy: "Korean search and local info",
    footerCopy: "Gwangalli, Busan · Hawaiian restaurant",
  },
  ko: {
    navHome: "홈",
    navMenu: "메뉴",
    navView: "뷰",
    navReserve: "예약",
    navLinks: "연결",
    heroEyebrow: "하와이안 레스토랑 · 광안리",
    heroTitle: "알로하는 인사, 오노는 맛있다는 뜻입니다.",
    heroCopy:
      "알로하오노는 하와이의 따뜻한 인사와 맛있는 한 접시를 광안리 바다 앞에서 전하는 하와이안 레스토랑입니다.",
    heroReserve: "예약 준비하기",
    heroExplore: "테이블 보기",
    cardLabel: "오늘의 알로하오노",
    cardTitle: "바다 앞 하와이안 푸드",
    cardCopy: "하와이안 무드, 컬러풀한 플레이트, 광안리 전망이 한 테이블에 모입니다.",
    introTitle: "인사가 맛있는 식사가 되는 곳.",
    introCopy:
      "알로하오노는 하와이의 인사말 Aloha와 맛있다는 뜻의 Ono를 합친 이름입니다. 그 의미처럼 하와이안 음식을 맛있고 편안하게 제공하는 광안리 레스토랑입니다.",
    menuTitle: "밝고 신선하게 즐기는 하와이안 플레이트.",
    menuOneTitle: "아사이볼",
    menuOneCopy: "과일, 그래놀라, 트로피컬한 색감으로 하와이의 밝은 맛을 담았습니다.",
    menuTwoTitle: "하와이안 브런치",
    menuTwoCopy: "늦은 아침, 바다의 빛, 편안한 대화에 어울리는 넉넉한 플레이트입니다.",
    menuThreeTitle: "프레시 아일랜드 샐러드",
    menuThreeCopy: "신선한 채소와 단백질을 하와이안 무드로 균형 있게 담았습니다.",
    viewTitle: "광안리 전망과 함께 즐기는 하와이안 음식.",
    viewCopy:
      "알로하오노는 하와이의 여유로운 식문화를 광안리로 옮깁니다. 바다, 다리, 햇빛, 그리고 맛있는 음식이 반갑게 맞이합니다.",
    viewPointOne: "하와이안 음식",
    viewPointTwo: "오션뷰 테이블",
    viewPointThree: "광안리 방문 코스",
    homeReserveTitle: "광안리에서 하와이안 테이블을 준비할까요?",
    homeReserveCopy:
      "예약 페이지에서 메뉴판을 먼저 확인한 뒤 Google, Instagram, Naver 예약으로 이어갈 수 있습니다.",
    reservationEyebrow: "메뉴 확인 · 예약 이동",
    reservationTitle: "하와이안 메뉴를 확인하고 테이블을 예약하세요.",
    reservationCopy:
      "알로하오노 메뉴판을 먼저 확인한 뒤 Google, Instagram, Naver 예약 채널로 이어가세요.",
    menuBoardTitle: "알로하오노 메뉴판",
    menuBoardCopy:
      "페이지에서 메뉴판을 확인하거나, 브라우저에서 잘 보이지 않으면 PDF를 직접 열어보세요.",
    downloadMenu: "메뉴 PDF 열기",
    reserveTitle: "알로하오노 방문을 준비하세요.",
    reserveCopy:
      "이 페이지에서는 예약 정보를 수집하지 않습니다. 아래 공식 채널로 이어가며, 실제 예약은 네이버 예약에서 진행할 수 있습니다.",
    googleReserveCopy: "위치와 매장 정보를 확인합니다.",
    instagramReserveCopy: "최신 사진과 소식을 보고 문의합니다.",
    naverReserveCopy: "네이버 예약으로 바로 이동합니다.",
    linksTitle: "검색에서 방문까지 이어집니다.",
    googleCopy: "지도 검색과 경로 확인",
    instagramCopy: "사진, 분위기, 소식 확인",
    naverCopy: "국내 검색과 지역 정보",
    footerCopy: "부산 광안리 · 하와이안 레스토랑",
  },
};

let currentLang = DEFAULT_LANG;

const getStoredValue = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStoredValue = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Language persistence is optional; the page still works without storage.
  }
};

const getSavedLanguage = () => {
  const savedLanguage = getStoredValue(LANGUAGE_STORAGE_KEY);
  return translations[savedLanguage] ? savedLanguage : DEFAULT_LANG;
};

const updateExternalLinks = () => {
  document.querySelectorAll("[data-external-link]").forEach((node) => {
    const linkKey = node.dataset.externalLink;
    const url = EXTERNAL_LINKS[linkKey];
    if (url) {
      node.href = url;
    }
  });
};

const applyLanguage = (lang) => {
  currentLang = lang;
  document.documentElement.lang = lang;
  setStoredValue(LANGUAGE_STORAGE_KEY, lang);

  const toggle = document.querySelector("[data-lang-toggle]");
  if (toggle) {
    toggle.textContent = lang === "en" ? "KR" : "EN";
    toggle.setAttribute("aria-label", lang === "en" ? "Switch to Korean" : "Switch to English");
  }

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (translations[lang][key]) {
      node.textContent = translations[lang][key];
    }
  });
};

const languageToggle = document.querySelector("[data-lang-toggle]");
if (languageToggle) {
  languageToggle.addEventListener("click", () => {
    applyLanguage(currentLang === "en" ? "ko" : "en");
  });
}

updateExternalLinks();
applyLanguage(getSavedLanguage());
