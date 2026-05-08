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

export const SPORTS_TABS: Record<string, TabDef[]> = {
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
