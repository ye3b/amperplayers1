export type FieldDef =
  | { type: 'text';        id: string; label: string; placeholder?: string; required?: boolean }
  | { type: 'number';      id: string; label: string; unit?: string; placeholder?: string; required?: boolean }
  | { type: 'radio';       id: string; label: string; options: string[]; required?: boolean }
  | { type: 'select';      id: string; label: string; options: string[]; required?: boolean }
  | { type: 'multiselect'; id: string; label: string; options: string[] }
  | { type: 'slider';      id: string; label: string; min: number; max: number; step: number; unit: string }

export interface TabDef {
  id: string
  label: string
  fields: FieldDef[]
}

const UNIFORM_FIELDS: FieldDef[] = [
  { type: 'text',   id: 'brand',         label: '브랜드',       placeholder: '나이키, 아디다스 등', required: true },
  { type: 'select', id: 'size',          label: '사이즈',       options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'] },
  { type: 'text',   id: 'team',          label: '팀',           placeholder: '팀명 입력' },
  { type: 'text',   id: 'markingName',   label: '마킹 - 이름',  placeholder: '없으면 비워두세요' },
  { type: 'text',   id: 'markingNumber', label: '마킹 - 등번호', placeholder: '없으면 비워두세요' },
  { type: 'radio',  id: 'authentic',     label: '종류',         options: ['어센틱', '레플리카'] },
  { type: 'text',   id: 'purchasePlace', label: '구매처',       placeholder: '쿠팡, 공식몰 등' },
]

const SHAFT_FLEX: FieldDef = { type: 'radio', id: 'shaftFlex', label: '샤프트 플렉스', options: ['R', 'SR', 'S', 'X'], required: true }
const SHAFT_MATERIAL: FieldDef = { type: 'radio', id: 'shaftMaterial', label: '샤프트 소재', options: ['카본', '스틸'], required: true }

export const SPORTS_TABS: Record<string, TabDef[]> = {
  golf: [
    {
      id: 'driver', label: '드라이버',
      fields: [
        { type: 'text',   id: 'brand',      label: '브랜드',    placeholder: '타이틀리스트, 캘러웨이, 테일러메이드 등', required: true },
        { type: 'text',   id: 'model',      label: '모델명',    placeholder: 'SIM2 MAX, 파라다임 등', required: true },
        { type: 'radio',  id: 'loft',       label: '로프트각',   options: ['9.0°', '9.5°', '10.5°', '12.0°'], required: true },
        { type: 'text',   id: 'headVolume', label: '헤드 체적',  placeholder: '460cc' },
        SHAFT_FLEX,
        SHAFT_MATERIAL,
      ],
    },
    {
      id: 'wood', label: '우드/유틸',
      fields: [
        { type: 'text',   id: 'brand',    label: '브랜드',    placeholder: '타이틀리스트, 캘러웨이 등', required: true },
        { type: 'text',   id: 'model',    label: '모델명',    placeholder: '모델명 입력', required: true },
        { type: 'radio',  id: 'clubType', label: '종류',      options: ['우드', '유틸리티'], required: true },
        { type: 'radio',  id: 'number',   label: '번호',      options: ['3W', '5W', '7W', '3U', '4U', '5U', '6U'], required: true },
        SHAFT_FLEX,
        SHAFT_MATERIAL,
      ],
    },
    {
      id: 'iron', label: '아이언',
      fields: [
        { type: 'text',   id: 'brand',    label: '브랜드',    placeholder: '타이틀리스트, 미즈노, 핑 등', required: true },
        { type: 'text',   id: 'model',    label: '모델명',    placeholder: 'T200, JPX925 등', required: true },
        { type: 'text',   id: 'composition', label: '구성',   placeholder: '5~9, PW', required: true },
        { type: 'radio',  id: 'headType', label: '헤드 타입',  options: ['캐비티', '머슬백', '중공'], required: true },
        SHAFT_FLEX,
        SHAFT_MATERIAL,
      ],
    },
    {
      id: 'wedge', label: '웨지',
      fields: [
        { type: 'text',   id: 'brand',   label: '브랜드',    placeholder: '타이틀리스트, 클리블랜드 등', required: true },
        { type: 'text',   id: 'model',   label: '모델명',    placeholder: '보키 SM9, RTX6 등', required: true },
        { type: 'radio',  id: 'loft',    label: '로프트각',   options: ['48°', '50°', '52°', '54°', '56°', '58°', '60°'], required: true },
        { type: 'radio',  id: 'bounce',  label: '바운스',    options: ['로우', '미드', '하이'] },
      ],
    },
    {
      id: 'putter', label: '퍼터',
      fields: [
        { type: 'text',   id: 'brand',    label: '브랜드',    placeholder: '스카티카메론, 오딧세이, 핑 등', required: true },
        { type: 'text',   id: 'model',    label: '모델명',    placeholder: '뉴포트 2, 스파이더 등', required: true },
        { type: 'radio',  id: 'headType', label: '헤드 타입',  options: ['블레이드', '말렛'], required: true },
        { type: 'number', id: 'length',   label: '길이',      unit: 'inch', placeholder: '34' },
      ],
    },
  ],

  running: [
    {
      id: 'shoes', label: '러닝화',
      fields: [
        { type: 'text',   id: 'brand',     label: '브랜드',       placeholder: '나이키, 아식스, 호카, 브룩스 등', required: true },
        { type: 'text',   id: 'model',     label: '모델명',       placeholder: '페가수스 41, 젤카야노 31 등', required: true },
        { type: 'number', id: 'sizeMM',    label: '사이즈',       unit: 'mm', placeholder: '265', required: true },
        { type: 'radio',  id: 'usage',     label: '용도',         options: ['데일리/조깅', '레이스/마라톤', '트레일'], required: true },
        { type: 'radio',  id: 'cushioning', label: '쿠셔닝',     options: ['맥시멀', '미드', '미니멀'], required: true },
        { type: 'radio',  id: 'widthType', label: '발볼 타입',    options: ['좁음', '보통', '넓음'], required: true },
        { type: 'radio',  id: 'soleWear',  label: '밑창 마모 상태', options: ['새것 같음', '약간 마모', '보통 마모', '심한 마모'], required: true },
      ],
    },
  ],

  cycling: [
    {
      id: 'bicycle', label: '자전거',
      fields: [
        { type: 'radio',  id: 'bikeType',     label: '자전거 종류',   options: ['로드', 'MTB', '하이브리드', '미니벨로', '그래블', '픽시'], required: true },
        { type: 'text',   id: 'brand',        label: '브랜드',       placeholder: '트렉, 자이언트, 스페셜라이즈드 등', required: true },
        { type: 'text',   id: 'model',        label: '모델명',       placeholder: '에밀리아 SL7, 디파이 등', required: true },
        { type: 'number', id: 'frameSize',    label: '프레임 사이즈', unit: 'cm', placeholder: '52', required: true },
        { type: 'radio',  id: 'frameMaterial', label: '프레임 소재',  options: ['카본', '알루미늄', '크로몰리', '티타늄'], required: true },
        { type: 'number', id: 'wheelSize',    label: '휠 사이즈',    unit: 'inch', placeholder: '27' },
        { type: 'text',   id: 'groupset',     label: '구동계',       placeholder: '시마노 105, SRAM Rival 등' },
        { type: 'text',   id: 'gearCount',    label: '변속 단수',    placeholder: '2x11, 1x12 등' },
        { type: 'text',   id: 'purchaseYear', label: '구매 연도',    placeholder: '2023' },
      ],
    },
  ],

  soccer: [
    {
      id: 'shoes', label: '축구화',
      fields: [
        { type: 'text',   id: 'brand',     label: '브랜드',         placeholder: '나이키, 아디다스 등',    required: true },
        { type: 'text',   id: 'model',     label: '모델명',         placeholder: '머큐리얼 슈퍼플라이 9 FG', required: true },
        { type: 'number', id: 'sizeMM',    label: '사이즈',      unit: 'mm',  placeholder: '265' },
        { type: 'radio',  id: 'studType',  label: '스터드 타입',    options: ['FG', 'AG', 'HG', 'TF'],            required: true },
        { type: 'radio',  id: 'widthType', label: '발볼 타입',      options: ['좁음', '보통', '넓음'],             required: true },
        { type: 'radio',  id: 'soleWear',  label: '밑창 마모 상태', options: ['새것 같음', '약간 마모', '보통 마모', '심한 마모'], required: true },
      ],
    },
    {
      id: 'ball', label: '축구공',
      fields: [
        { type: 'text',        id: 'brand',            label: '브랜드',       placeholder: '나이키, 아디다스 등', required: true },
        { type: 'text',        id: 'model',            label: '모델명',       placeholder: '텔스타 21' },
        { type: 'radio',       id: 'size',             label: '사이즈',       options: ['3', '4', '5'],                              required: true },
        { type: 'radio',       id: 'airRetention',     label: '공기 유지 상태', options: ['잘 유지', '조금 빠짐', '거의 없음'],       required: true },
        { type: 'multiselect', id: 'surfaceCondition', label: '표면 상태',    options: ['이상 없음', '스크래치', '패널 벌어짐'] },
        { type: 'radio',       id: 'shapeDeform',      label: '형태 변형',    options: ['원형 유지', '변형 있음'],                   required: true },
        { type: 'select',      id: 'certification',    label: '인증 여부',    options: ['없음', 'FIFA Quality', 'FIFA Quality Pro', '기타'] },
      ],
    },
    { id: 'uniform', label: '유니폼', fields: UNIFORM_FIELDS },
  ],

  basketball: [
    {
      id: 'shoes', label: '농구화',
      fields: [
        { type: 'text',  id: 'brand',       label: '브랜드',         placeholder: '나이키, 아디다스 등', required: true },
        { type: 'text',  id: 'model',       label: '모델명',         placeholder: '에어 조던 1',        required: true },
        { type: 'text',  id: 'size',        label: '사이즈',         placeholder: '265mm / 42EU',       required: true },
        { type: 'radio', id: 'outsoleWear', label: '아웃솔 마모 상태', options: ['새것 같음', '약간 마모', '보통 마모', '심한 마모'], required: true },
        { type: 'radio', id: 'cushioning',  label: '쿠셔닝 상태',    options: ['좋음', '보통', '죽음'],              required: true },
        { type: 'radio', id: 'ankleType',   label: '발목 타입',      options: ['하이', '미드', '로우'],              required: true },
      ],
    },
    {
      id: 'ball', label: '농구공',
      fields: [
        { type: 'text',  id: 'brand',        label: '브랜드',       placeholder: '스팔딩, 윌슨 등', required: true },
        { type: 'text',  id: 'model',        label: '모델명',       placeholder: '모델명 입력' },
        { type: 'radio', id: 'size',         label: '사이즈',       options: ['5', '6', '7'],                              required: true },
        { type: 'radio', id: 'material',     label: '재질',         options: ['고무', '합성가죽', '천연가죽'],             required: true },
        { type: 'radio', id: 'grip',         label: '그립 상태',    options: ['좋음', '미끄러움'],                         required: true },
        { type: 'radio', id: 'airRetention', label: '공기 유지 상태', options: ['잘 유지', '조금 빠짐', '거의 없음'],     required: true },
        { type: 'radio', id: 'surfaceWear',  label: '표면 마모',    options: ['없음', '약간', '심함'],                     required: true },
        { type: 'radio', id: 'bounceIssue',  label: '바운스 이상',  options: ['없음', '있음'],                             required: true },
      ],
    },
    { id: 'uniform', label: '유니폼', fields: UNIFORM_FIELDS },
  ],

  baseball: [
    {
      id: 'glove', label: '글러브',
      fields: [
        { type: 'text',   id: 'brand',        label: '브랜드',        placeholder: '롤링스, 미즈노 등', required: true },
        { type: 'text',   id: 'model',        label: '모델명',        placeholder: '모델명 입력' },
        { type: 'radio',  id: 'position',     label: '포지션',        options: ['투수', '내야', '외야', '포수', '1루미트'], required: true },
        { type: 'radio',  id: 'throwHand',    label: '투구 방향',     options: ['우투', '좌투'],                           required: true },
        { type: 'text',   id: 'leatherType',  label: '가죽 종류',     placeholder: '스테어하이드, 킵 등' },
        { type: 'slider', id: 'conditioning', label: '길들이기 상태', min: 0, max: 100, step: 5, unit: '%' },
      ],
    },
    {
      id: 'bat', label: '배트',
      fields: [
        { type: 'text',   id: 'brand',       label: '브랜드',  placeholder: '루이빌, 미즈노 등', required: true },
        { type: 'text',   id: 'model',       label: '모델명',  placeholder: '모델명 입력' },
        { type: 'number', id: 'length',      label: '길이',    unit: 'inch', placeholder: '33' },
        { type: 'number', id: 'weight',      label: '무게',    unit: 'oz',   placeholder: '28' },
        { type: 'radio',  id: 'material',    label: '재질',    options: ['알루미늄', '카본', '나무'],   required: true },
        { type: 'radio',  id: 'crackStatus', label: '크랙 여부', options: ['없음', '있음'],             required: true },
      ],
    },
    {
      id: 'spike', label: '스파이크',
      fields: [
        { type: 'text',  id: 'brand',     label: '브랜드',      placeholder: '미즈노, 아식스 등', required: true },
        { type: 'text',  id: 'model',     label: '모델명',      placeholder: '모델명 입력' },
        { type: 'text',  id: 'size',      label: '사이즈',      placeholder: '265mm / 42EU',     required: true },
        { type: 'radio', id: 'studType',  label: '스터드 종류', options: ['인조잔디화', '포인트화', '콤프화', '징스파이크'], required: true },
        { type: 'radio', id: 'widthType', label: '발볼 타입',   options: ['좁음', '보통', '넓음'],                         required: true },
        { type: 'radio', id: 'soleWear',  label: '밑창 마모 상태', options: ['새것 같음', '약간 마모', '보통 마모', '심한 마모'], required: true },
      ],
    },
    {
      id: 'protection', label: '보호장비',
      fields: [
        { type: 'radio', id: 'gearType',  label: '종류',   options: ['암가드', '풋가드', '렉가드', '포수보호장비', '하이바'], required: true },
        { type: 'text',  id: 'brand',     label: '브랜드', placeholder: '브랜드명 입력' },
        { type: 'text',  id: 'size',      label: '사이즈', placeholder: 'S / M / L' },
        { type: 'radio', id: 'condition', label: '상태',   options: ['새것 같음', '양호', '보통', '사용감 있음'], required: true },
      ],
    },
    { id: 'uniform', label: '유니폼', fields: UNIFORM_FIELDS },
  ],
}
