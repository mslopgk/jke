/**
 * All copy and factual data for the JKE homepage.
 *
 * Every date, award and certification below was taken verbatim from the
 * company history page on jke.kr (기업소개 > 회사연혁). Nothing here is invented.
 * If a figure is not on that page it is deliberately absent — see
 * docs/superpowers/specs/2026-08-17-jke-homepage-design.md §4.1.
 */

export const COMPANY = {
  founded: 2002,
  address: '부산광역시 강서구 미음산단로 105번길 34 (구랑동)',
  tel: '051.974.9500',
  fax: '051.974.9595',
}

/** Years since founding, computed so it never goes stale. */
export const yearsInBusiness = () => new Date().getFullYear() - COMPANY.founded

export const NAV = [
  { label: '기업소개', href: 'http://www.jke.kr/sub01/sub01_01.php' },
  { label: '사업분야', href: 'http://www.jke.kr/sub02/sub02_01.php' },
  { label: '제품소개', href: 'http://www.jke.kr/bbs/board.php?bo_table=sub03_01&wr_id=1' },
  { label: 'R&D', href: 'http://www.jke.kr/bbs/board.php?bo_table=ceri1' },
  { label: 'PARTNER', href: 'http://www.jke.kr/sub05/sub05_01.php' },
  { label: '고객지원', href: 'http://www.jke.kr/sub06/sub06_01.php' },
]

export const SCENES = [
  { id: 'hero', index: '01', label: 'INTRO' },
  { id: 'threshold', index: '02', label: 'INSIDE' },
  { id: 'business', index: '03', label: 'SECTORS' },
  { id: 'products', index: '04', label: 'PRODUCTS' },
  { id: 'numbers', index: '05', label: 'RECORD' },
  { id: 'timeline', index: '06', label: 'HISTORY' },
  { id: 'contact', index: '07', label: 'CONTACT' },
]

export const SECTORS = [
  {
    index: '01',
    en: 'OFFSHORE',
    ko: '해양플랜트',
    image: 'offshore',
    body:
      'FPSO·드릴십·고정식 플랫폼의 폭발위험 구역에 들어가는 전기 시스템. ' +
      'IECEx / ATEX Ex e·ia·tb IP66/67 인증을 Key Type과 Bolting Type 양쪽으로 보유하고 있으며, ' +
      'Phoenix Mecano(ROSE)의 한국 방폭 공장으로 등록되어 있습니다.',
    specs: ['IECEx / ATEX Ex e, ia, tb', 'IP66 / IP67', 'Phoenix Mecano (ROSE) 등록 공장'],
  },
  {
    index: '02',
    en: 'SHIPBUILDING',
    ko: '조선',
    image: 'shipbuilding',
    body:
      '2002년 대우조선해양 협력업체 등록을 시작으로 삼성중공업·현대중공업까지 ' +
      '국내 3대 조선소의 협력 체계를 모두 갖췄습니다. 주배전반부터 항해등 제어반까지 ' +
      '선박 한 척의 전기 계통을 통째로 설계·제작합니다.',
    specs: ['대우조선해양 · 삼성중공업 · 현대중공업', 'DNV / KR Type Approval', 'DSME 품질경영 A등급'],
  },
  {
    index: '03',
    en: 'BUILDING',
    ko: '산업·건축',
    image: 'building',
    body:
      '육상 플랜트와 건축물의 수배전 설비. 2020년 단체표준제품인증과 정부조달 MAS ' +
      '등록을 마쳐 고압·저압배전반, 전동기제어반, 분전반, 태양광발전장치를 ' +
      '공공 조달로 직접 공급합니다.',
    specs: ['단체표준제품인증 (2020)', '정부조달 MAS 등록', 'Siemens LV Switchgear License Partner'],
  },
]

export const PRODUCTS = [
  {
    en: 'SWITCHBOARD',
    ko: '주배전반',
    image: 'p-switchboard',
    body: '선박·플랜트 전력 계통의 심장. 발전기 제어와 부하 분배를 한 몸에서 처리합니다.',
  },
  {
    en: 'MOTOR CONTROL CENTER',
    ko: '전동기 제어반',
    image: 'p-mcc',
    body: '인출형 드로어 구조로 운전 중에도 개별 모듈을 교체할 수 있습니다.',
  },
  {
    en: 'VFD',
    ko: '가변주파수 구동반',
    image: 'p-vfd',
    body: '펌프·팬의 회전수를 부하에 맞춰 조절해 연료와 전력을 함께 줄입니다.',
  },
  {
    en: 'DISTRIBUTION BOARD',
    ko: '분전반',
    image: 'p-distribution',
    body: '말단 부하까지의 배선을 정리하고 보호하는 마지막 관문.',
  },
  {
    en: 'JUNCTION BOX',
    ko: '접속함',
    image: 'p-junctionbox',
    body: 'ATEX 방폭 인증을 받은 볼팅 타입 스테인리스 함체. IP66/67 등급.',
  },
  {
    en: 'CONSOLE',
    ko: '조작 콘솔',
    image: 'p-console',
    body: '선교와 기관실의 조작 환경을 사람의 손높이에 맞춰 설계합니다.',
  },
  {
    en: 'BOOTH',
    ko: '전기실 부스',
    image: 'p-booth',
    body: '현장 조건에 맞춰 제작하는 독립형 전기실 캐빈.',
  },
  {
    en: 'NAVIGATION CONTROL',
    ko: '항해등 제어반',
    image: 'p-navlight',
    body: '2013년 DNV Type Approval을 받은 항해등 제어 계통.',
  },
  {
    en: 'MAS 단체표준인증품',
    ko: '정부조달',
    image: 'p-mas',
    body: '고압·저압배전반, 전동기제어반, 분전반, 태양광발전장치를 조달청 다수공급자계약으로 공급합니다.',
  },
]

export const STATS = [
  { value: 2002, suffix: '', label: '회사설립', sub: '2002.05 · 대우조선해양 협력업체 등록' },
  { value: null, dynamic: 'years', suffix: '년', label: '축적된 제조 경험', sub: '단절 없이 이어온 배전반 제작' },
  { value: 1000, suffix: '만불', group: true, label: '수출의 탑', sub: '2010.11 수상 · 2009년 5백만불에 이어' },
  { value: 1, prefix: '배전반 부문 ', suffix: '위', label: '현대일렉트릭 품질평가', sub: '2019.11 우수 협력사 선정' },
]

export const CERTS = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'IECEx / ATEX', 'UL 508A', 'DNV · KR Type Approval', 'INNO-BIZ', 'MAIN-BIZ']

/** 회사연혁 — jke.kr 기업소개 > 회사연혁 전문. */
export const HISTORY = [
  { year: 2002, events: [['05', '회사설립'], ['05', '대우조선해양 협력업체 등록']] },
  { year: 2003, events: [['09', '미국 Graybar 국내 agent 체결']] },
  { year: 2004, events: [['07', 'DNV, KS A ISO 9001:2000 인증']] },
  { year: 2005, events: [['01', 'DSME 우수협력업체 선정'], ['08', 'UL 508A 승인']] },
  { year: 2006, events: [['05', '삼성중공업 협력업체 등록'], ['08', '현대중공업 협력업체 등록']] },
  { year: 2007, events: [['10', 'LS산전 선박용 변압기 특약점 1호 등록']] },
  { year: 2008, events: [['02', '슈나이더 일렉트릭 Prisma 기술협약']] },
  { year: 2009, events: [['11', '5백만불 수출의 탑 수상']] },
  { year: 2010, events: [['11', '1천만불 수출의 탑 수상'], ['12', 'JBB IP56 Type Approval 획득 (KR)']] },
  { year: 2011, events: [['06', 'JBC/D IP66/44 Type Approval 획득 (KR)']] },
  { year: 2013, events: [['03', 'JBG ATEX 방폭 Certificate 획득 (DEKRA)'], ['06', 'NAVIGATION LIGHTING CONTROL Type Approval 획득 (DNV)']] },
  { year: 2015, events: [['01', 'DSME 협력업체 품질경영시스템 평가 A등급'], ['06', 'MAIN-BIZ · 기업부설연구소 인정'], ['09', '㈜JKE 상호 변경'], ['11', '벤처기업 인정']] },
  { year: 2016, events: [['01', 'INNO-BIZ 기술혁신형 중소기업 인정'], ['06', 'ISO 14001, OHSAS 18001 인증'], ['08', '부산 미음공단 확장 신축 이전']] },
  { year: 2017, events: [['04', 'Phoenix Mecano (ROSE) 한국 방폭 공장 등록'], ['12', 'IECEx / ATEX Ex e, ia, tb IP66/67 인증 (Key Type)']] },
  { year: 2018, events: [['03', 'IECEx / ATEX Ex e, ia, tb IP66/67 인증 (Bolting Type)'], ['08', 'ISO 9001/14001:2015 전환 완료']] },
  { year: 2019, events: [['07', 'Siemens LV Switchgear License Partner 계약'], ['11', '현대일렉트릭 품질평가 우수 협력사 선정 (배전반 부문 1위)']] },
  { year: 2020, events: [['02', '단체표준제품인증'], ['04', '정부조달 MAS 등록'], ['06', 'ISO 9001 / 14001 / 45001 인증']] },
]

export const PARTNERS = [
  '대우조선해양', '삼성중공업', '현대중공업', '현대일렉트릭',
  'Siemens', 'Schneider Electric', 'LS ELECTRIC', 'Phoenix Mecano', 'Graybar',
]
