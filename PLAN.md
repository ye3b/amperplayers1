# 스포츠 용품 중고거래 서비스 개발 계획

## 서비스 개요

스포츠 용품 전문 중고거래 플랫폼. 판매자가 물품을 등록하고, 구매자가 채팅으로 거래하는 구조.

---

## 기술 스택

| 영역 | 기술 | 이유 |
|------|------|------|
| Frontend | Next.js 14 (App Router) | FE/BE 통합, 별도 서버 불필요 |
| Backend | Next.js API Routes | Next.js 내장, 추가 서버 불필요 |
| Database | PostgreSQL + Prisma ORM | 안정적, Prisma로 쿼리 간소화 |
| 인증 | NextAuth.js | 소셜 로그인 간편 구현 |
| 이미지 업로드 | Cloudinary (무료 플랜) | 별도 스토리지 서버 불필요 |
| 스타일 | Tailwind CSS | 빠른 UI 개발 |
| 배포 | Vercel + Supabase | 무료 플랜으로 운영 가능 |

---

## 핵심 기능 (MVP)

### 1. 사용자
- 회원가입 / 로그인 (이메일 or 카카오)
- 프로필 페이지 (내 판매 목록, 거래 내역)

### 2. 상품
- 상품 등록 (사진, 제목, 가격, 카테고리, 상태, 설명)
- 상품 목록 (카테고리 필터, 검색)
- 상품 상세 페이지

### 3. 거래
- 채팅 (구매자 ↔ 판매자)
- 찜하기 (관심 상품 저장)
- 거래 상태 관리 (판매중 / 예약중 / 판매완료)

---

## 카테고리

- 구기 (축구, 농구, 야구, 테니스 등)
- 헬스 / 피트니스
- 아웃도어 (등산, 캠핑)
- 수상 스포츠
- 동계 스포츠
- 기타

---

## DB 스키마 (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  image     String?
  phone     String?
  createdAt DateTime @default(now())

  products  Product[]
  chats     Chat[]
  likes     Like[]
}

model Product {
  id          String        @id @default(cuid())
  title       String
  description String
  price       Int
  category    String
  condition   String        // 새상품 / 거의새것 / 사용감있음 / 많이사용함
  status      ProductStatus @default(AVAILABLE)
  images      String[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  sellerId    String
  seller      User          @relation(fields: [sellerId], references: [id])
  chats       Chat[]
  likes       Like[]
}

enum ProductStatus {
  AVAILABLE   // 판매중
  RESERVED    // 예약중
  SOLD        // 판매완료
}

model Chat {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())

  productId String
  product   Product   @relation(fields: [productId], references: [id])
  buyerId   String
  buyer     User      @relation(fields: [buyerId], references: [id])
  messages  Message[]
}

model Message {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())

  chatId    String
  chat      Chat     @relation(fields: [chatId], references: [id])
  senderId  String
}

model Like {
  userId    String
  productId String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])

  @@id([userId, productId])
}
```

---

## 페이지 구조

```
/                       홈 (최신 상품 목록)
/products               전체 상품 목록
/products/[id]          상품 상세
/products/new           상품 등록
/products/[id]/edit     상품 수정
/chat                   채팅 목록
/chat/[id]              채팅방
/profile                내 프로필
/profile/[id]           다른 유저 프로필
/login                  로그인
```

---

## TODO

### Phase 1 - 프로젝트 초기 세팅
- [ ] Next.js 프로젝트 생성 (`npx create-next-app`)
- [ ] Tailwind CSS 설정
- [ ] Prisma + PostgreSQL 연결
- [ ] NextAuth.js 설정 (이메일 로그인)
- [ ] Cloudinary 계정 생성 및 연동
- [ ] Vercel 배포 초기 세팅

### Phase 2 - 인증
- [ ] 회원가입 / 로그인 페이지 UI
- [ ] NextAuth 세션 관리
- [ ] 로그인 상태에 따른 라우트 보호

### Phase 3 - 상품
- [ ] 상품 등록 폼 (이미지 업로드 포함)
- [ ] 상품 목록 페이지 (카테고리 필터, 검색)
- [ ] 상품 상세 페이지
- [ ] 상품 수정 / 삭제
- [ ] 거래 상태 변경 (판매중 → 예약중 → 완료)

### Phase 4 - 채팅
- [ ] 채팅방 생성 (상품 상세에서 "채팅하기" 버튼)
- [ ] 채팅 목록 페이지
- [ ] 채팅방 UI 및 메시지 전송

### Phase 5 - 부가 기능
- [ ] 찜하기 기능
- [ ] 내 프로필 페이지 (판매 목록)
- [ ] 다른 유저 프로필 조회

### Phase 6 - 마무리
- [ ] 반응형 UI 점검 (모바일)
- [ ] Vercel + Supabase 운영 배포
- [ ] 기본 SEO 설정

---

## 폴더 구조

```
/app
  /api
    /auth           NextAuth
    /products       상품 CRUD API
    /chat           채팅 API
    /likes          찜 API
  /(pages)
    /products
    /chat
    /profile
    /login
/components
  /ui               공통 UI (버튼, 인풋 등)
  /product          상품 관련 컴포넌트
  /chat             채팅 관련 컴포넌트
/lib
  prisma.ts         Prisma 클라이언트
  cloudinary.ts     이미지 업로드 유틸
/prisma
  schema.prisma
```

---

## 운영 비용 (무료 범위 기준)

| 서비스 | 무료 한도 | 비고 |
|--------|-----------|------|
| Vercel | 월 100GB 대역폭 | 소규모 트래픽 충분 |
| Supabase | DB 500MB, 50MB 파일 | 초기 운영 가능 |
| Cloudinary | 월 25GB 스토리지 | 이미지 충분 |

---

## 개발 우선순위

소규모 서비스이므로 복잡한 기능보다 **핵심 거래 흐름** 완성을 우선.

> 상품 등록 → 목록/검색 → 상세 → 채팅 → 거래 완료
