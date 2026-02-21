# Etsy Dropshipping Otomasyon - Tam Sistem Mimarisi ve Klasör Yapısı

## İçindekiler
1. [Genel Sistem Mimarisi](#genel-sistem-mimarisi)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Backend Klasör Yapısı](#backend-klasör-yapısı)
4. [Frontend Klasör Yapısı](#frontend-klasör-yapısı)
5. [Airtable (Atigravity) Entegrasyonu](#airtable-atigravity-entegrasyonu)
6. [Database Schema](#database-schema)
7. [API Endpoint'leri](#api-endpointleri)
8. [Deployment Stratejisi](#deployment-stratejisi)

---

## Genel Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
│                     (Next.js 14 + React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │ Product Edit │  │ Etsy Manager │          │
│  │    Panel     │  │    Panel     │  │    Panel     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                              │
│                      (Next.js API Routes)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                             │
│                     (NestJS + TypeScript)                        │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    CORE MODULES                         │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │   Scraper    │  │  AI Content  │  │     Etsy     │ │    │
│  │  │   Service    │  │   Service    │  │   Service    │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │    Image     │  │   Product    │  │     Job      │ │    │
│  │  │   Service    │  │   Service    │  │   Queue      │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │    │   Airtable   │
│   Database   │    │    Cache     │    │  (Atigravity)│
└──────────────┘    └──────────────┘    └──────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   OpenAI     │    │     Etsy     │    │  Cloudinary  │
│     API      │    │     API      │    │     API      │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## Teknoloji Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Runtime**: Node.js 20.x
- **Database**: PostgreSQL 16
- **Cache & Queue**: Redis 7.x
- **ORM**: Prisma
- **Queue Management**: BullMQ
- **Validation**: class-validator, class-transformer
- **Authentication**: Passport.js + JWT
- **File Upload**: Multer
- **HTTP Client**: Axios
- **Scraping**: Playwright

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (21st.dev inspired)
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: TanStack Query (React Query)
- **Image Editing**: react-image-crop, react-easy-crop
- **Drag & Drop**: dnd-kit

### External Services
- **Database Alternative**: Airtable (Atigravity)
- **AI**: OpenAI API (GPT-4)
- **Image Processing**: Cloudinary
- **E-commerce**: Etsy API
- **Background Removal**: Remove.bg (optional)

### DevOps & Deployment
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Frontend) + Railway/Render (Backend)
- **Monitoring**: Sentry

---

## Backend Klasör Yapısı

```
etsy-dropshipping-backend/
│
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   │
│   ├── config/                          # Configuration
│   │   ├── config.module.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── airtable.config.ts
│   │   ├── openai.config.ts
│   │   ├── etsy.config.ts
│   │   └── cloudinary.config.ts
│   │
│   ├── common/                          # Shared utilities
│   │   ├── decorators/
│   │   │   ├── auth.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── utils/
│   │       ├── string.utils.ts
│   │       ├── image.utils.ts
│   │       └── seo.utils.ts
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/                        # Authentication Module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   │
│   │   ├── users/                       # User Management
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── scraper/                     # Product Scraping Module
│   │   │   ├── scraper.module.ts
│   │   │   ├── scraper.controller.ts
│   │   │   ├── scraper.service.ts
│   │   │   ├── providers/
│   │   │   │   ├── aliexpress.scraper.ts
│   │   │   │   ├── amazon.scraper.ts     # Phase 2
│   │   │   │   └── base.scraper.ts
│   │   │   ├── dto/
│   │   │   │   ├── scrape-product.dto.ts
│   │   │   │   └── scraped-product.dto.ts
│   │   │   └── interfaces/
│   │   │       └── scraper.interface.ts
│   │   │
│   │   ├── ai-content/                  # AI Content Generation
│   │   │   ├── ai-content.module.ts
│   │   │   ├── ai-content.controller.ts
│   │   │   ├── ai-content.service.ts
│   │   │   ├── providers/
│   │   │   │   ├── openai.provider.ts
│   │   │   │   └── claude.provider.ts    # Optional
│   │   │   ├── dto/
│   │   │   │   ├── generate-content.dto.ts
│   │   │   │   └── generated-content.dto.ts
│   │   │   └── templates/
│   │   │       ├── title.template.ts
│   │   │       ├── description.template.ts
│   │   │       └── tags.template.ts
│   │   │
│   │   ├── images/                      # Image Processing Module
│   │   │   ├── images.module.ts
│   │   │   ├── images.controller.ts
│   │   │   ├── images.service.ts
│   │   │   ├── providers/
│   │   │   │   ├── cloudinary.provider.ts
│   │   │   │   └── removebg.provider.ts
│   │   │   ├── dto/
│   │   │   │   ├── upload-image.dto.ts
│   │   │   │   ├── process-image.dto.ts
│   │   │   │   └── image-response.dto.ts
│   │   │   └── processors/
│   │   │       ├── crop.processor.ts
│   │   │       ├── resize.processor.ts
│   │   │       └── background-remove.processor.ts
│   │   │
│   │   ├── etsy/                        # Etsy Integration Module
│   │   │   ├── etsy.module.ts
│   │   │   ├── etsy.controller.ts
│   │   │   ├── etsy.service.ts
│   │   │   ├── etsy-auth.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-listing.dto.ts
│   │   │   │   ├── update-listing.dto.ts
│   │   │   │   └── listing-response.dto.ts
│   │   │   └── interfaces/
│   │   │       └── etsy-listing.interface.ts
│   │   │
│   │   ├── products/                    # Product Management Module
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── product.entity.ts
│   │   │   │   ├── product-image.entity.ts
│   │   │   │   └── product-variant.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-product.dto.ts
│   │   │       ├── update-product.dto.ts
│   │   │       └── product-response.dto.ts
│   │   │
│   │   ├── jobs/                        # Background Jobs Module
│   │   │   ├── jobs.module.ts
│   │   │   ├── processors/
│   │   │   │   ├── scraper.processor.ts
│   │   │   │   ├── ai-content.processor.ts
│   │   │   │   ├── image-upload.processor.ts
│   │   │   │   └── etsy-upload.processor.ts
│   │   │   └── queues/
│   │   │       ├── scraper.queue.ts
│   │   │       ├── ai-content.queue.ts
│   │   │       └── etsy-upload.queue.ts
│   │   │
│   │   └── airtable/                    # Airtable (Atigravity) Module
│   │       ├── airtable.module.ts
│   │       ├── airtable.service.ts
│   │       ├── repositories/
│   │       │   ├── products.repository.ts
│   │       │   ├── users.repository.ts
│   │       │   └── jobs.repository.ts
│   │       └── dto/
│   │           ├── airtable-record.dto.ts
│   │           └── airtable-query.dto.ts
│   │
│   ├── database/                        # Database (if using PostgreSQL)
│   │   ├── migrations/
│   │   └── seeds/
│   │
│   └── prisma/                          # Prisma ORM (if using PostgreSQL)
│       ├── schema.prisma
│       └── migrations/
│
├── test/                                # Tests
│   ├── unit/
│   └── e2e/
│
├── .env.example                         # Environment variables template
├── .env
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## Frontend Klasör Yapısı

```
etsy-dropshipping-frontend/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── (auth)/                      # Auth group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/                 # Dashboard group
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── etsy-listings/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                         # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── products/
│   │   │   │   └── route.ts
│   │   │   └── proxy/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Home page
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/                      # React Components
│   │   │
│   │   ├── ui/                          # Base UI Components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── progress.tsx
│   │   │   └── spinner.tsx
│   │   │
│   │   ├── layout/                      # Layout Components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── dashboard-layout.tsx
│   │   │
│   │   ├── products/                    # Product Components
│   │   │   ├── product-card.tsx
│   │   │   ├── product-list.tsx
│   │   │   ├── product-form.tsx
│   │   │   ├── product-preview.tsx
│   │   │   ├── url-scraper-form.tsx
│   │   │   └── variant-manager.tsx
│   │   │
│   │   ├── images/                      # Image Components
│   │   │   ├── image-uploader.tsx
│   │   │   ├── image-editor.tsx
│   │   │   ├── image-cropper.tsx
│   │   │   ├── image-gallery.tsx
│   │   │   └── sortable-image-list.tsx
│   │   │
│   │   ├── ai/                          # AI Content Components
│   │   │   ├── content-generator.tsx
│   │   │   ├── title-generator.tsx
│   │   │   ├── description-editor.tsx
│   │   │   └── tag-manager.tsx
│   │   │
│   │   ├── etsy/                        # Etsy Components
│   │   │   ├── etsy-connect-button.tsx
│   │   │   ├── listing-preview.tsx
│   │   │   ├── publish-button.tsx
│   │   │   └── etsy-status-badge.tsx
│   │   │
│   │   └── common/                      # Common Components
│   │       ├── loading-spinner.tsx
│   │       ├── error-message.tsx
│   │       ├── success-message.tsx
│   │       ├── confirmation-dialog.tsx
│   │       └── breadcrumbs.tsx
│   │
│   ├── lib/                             # Utilities & Helpers
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   └── interceptors.ts
│   │   ├── utils/
│   │   │   ├── cn.ts                    # Class name utility
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── seo.ts
│   │   ├── hooks/
│   │   │   ├── use-toast.ts
│   │   │   ├── use-debounce.ts
│   │   │   ├── use-local-storage.ts
│   │   │   └── use-media-query.ts
│   │   └── constants/
│   │       ├── routes.ts
│   │       └── config.ts
│   │
│   ├── stores/                          # State Management (Zustand)
│   │   ├── auth-store.ts
│   │   ├── product-store.ts
│   │   ├── ui-store.ts
│   │   └── etsy-store.ts
│   │
│   ├── services/                        # API Services
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── scraper.service.ts
│   │   ├── ai-content.service.ts
│   │   ├── images.service.ts
│   │   └── etsy.service.ts
│   │
│   ├── types/                           # TypeScript Types
│   │   ├── product.types.ts
│   │   ├── user.types.ts
│   │   ├── etsy.types.ts
│   │   ├── api.types.ts
│   │   └── index.ts
│   │
│   └── styles/                          # Global Styles
│       ├── globals.css
│       └── themes.css
│
├── .env.local.example
├── .env.local
├── .gitignore
├── .eslintrc.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.js
└── README.md
```

---

## Airtable (Atigravity) Entegrasyonu

### Neden Airtable?
- PostgreSQL yerine kullanımı kolay alternatif
- REST API ile tam entegrasyon
- GUI üzerinden veri yönetimi
- Hızlı prototyping
- Maliyet etkin

### Airtable Base Yapısı

```
Base: Etsy Dropshipping Automation
│
├── Table: Users
│   ├── id (Auto Number)
│   ├── email (Email)
│   ├── password_hash (Long text)
│   ├── full_name (Single line text)
│   ├── etsy_shop_id (Single line text)
│   ├── etsy_access_token (Long text)
│   ├── etsy_refresh_token (Long text)
│   ├── created_at (Created time)
│   └── updated_at (Last modified time)
│
├── Table: Products
│   ├── id (Auto Number)
│   ├── user_id (Link to Users)
│   ├── source_url (URL)
│   ├── source_platform (Single select: AliExpress, Amazon, etc.)
│   ├── original_title (Long text)
│   ├── generated_title (Long text)
│   ├── original_description (Long text)
│   ├── generated_description (Long text)
│   ├── generated_tags (Multiple select)
│   ├── price (Currency)
│   ├── status (Single select: Draft, Ready, Published, Failed)
│   ├── etsy_listing_id (Single line text)
│   ├── created_at (Created time)
│   └── updated_at (Last modified time)
│
├── Table: Product_Images
│   ├── id (Auto Number)
│   ├── product_id (Link to Products)
│   ├── image_url (URL)
│   ├── cloudinary_id (Single line text)
│   ├── order_index (Number)
│   ├── width (Number)
│   ├── height (Number)
│   ├── is_primary (Checkbox)
│   └── created_at (Created time)
│
├── Table: Product_Variants
│   ├── id (Auto Number)
│   ├── product_id (Link to Products)
│   ├── variant_name (Single line text)
│   ├── variant_value (Single line text)
│   ├── price_modifier (Currency)
│   ├── sku (Single line text)
│   └── stock (Number)
│
└── Table: Jobs
    ├── id (Auto Number)
    ├── user_id (Link to Users)
    ├── product_id (Link to Products)
    ├── job_type (Single select: Scraping, AI Generation, Image Processing, Etsy Upload)
    ├── status (Single select: Pending, Processing, Completed, Failed)
    ├── progress (Number 0-100)
    ├── error_message (Long text)
    ├── created_at (Created time)
    └── completed_at (Date)
```

### Airtable API Kullanımı

**Backend'de Airtable Service Örneği:**

```typescript
// src/modules/airtable/airtable.service.ts

import Airtable from 'airtable';

export class AirtableService {
  private base: Airtable.Base;

  constructor() {
    const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
    this.base = airtable.base(process.env.AIRTABLE_BASE_ID);
  }

  // Users
  async createUser(userData: any) {
    return await this.base('Users').create(userData);
  }

  async findUserByEmail(email: string) {
    const records = await this.base('Users')
      .select({ filterByFormula: `{email} = '${email}'` })
      .firstPage();
    return records[0];
  }

  // Products
  async createProduct(productData: any) {
    return await this.base('Products').create(productData);
  }

  async updateProduct(recordId: string, productData: any) {
    return await this.base('Products').update(recordId, productData);
  }

  async getProductsByUser(userId: string) {
    return await this.base('Products')
      .select({ filterByFormula: `{user_id} = '${userId}'` })
      .all();
  }

  // Images
  async createProductImages(imagesData: any[]) {
    return await this.base('Product_Images').create(imagesData);
  }
}
```

---

## Database Schema

### PostgreSQL Alternatifi (Eğer Airtable yerine kullanılırsa)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  passwordHash        String    @map("password_hash")
  fullName            String?   @map("full_name")
  etsyShopId          String?   @map("etsy_shop_id")
  etsyAccessToken     String?   @map("etsy_access_token")
  etsyRefreshToken    String?   @map("etsy_refresh_token")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  
  products            Product[]
  jobs                Job[]

  @@map("users")
}

model Product {
  id                    String    @id @default(uuid())
  userId                String    @map("user_id")
  sourceUrl             String    @map("source_url")
  sourcePlatform        String    @map("source_platform")
  originalTitle         String    @map("original_title")
  generatedTitle        String?   @map("generated_title")
  originalDescription   String    @map("original_description") @db.Text
  generatedDescription  String?   @map("generated_description") @db.Text
  generatedTags         String[]  @map("generated_tags")
  price                 Decimal?  @db.Decimal(10, 2)
  status                String    @default("draft")
  etsyListingId         String?   @map("etsy_listing_id")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  images                ProductImage[]
  variants              ProductVariant[]
  jobs                  Job[]

  @@map("products")
}

model ProductImage {
  id              String    @id @default(uuid())
  productId       String    @map("product_id")
  imageUrl        String    @map("image_url")
  cloudinaryId    String?   @map("cloudinary_id")
  orderIndex      Int       @map("order_index")
  width           Int?
  height          Int?
  isPrimary       Boolean   @default(false) @map("is_primary")
  createdAt       DateTime  @default(now()) @map("created_at")
  
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

model ProductVariant {
  id              String    @id @default(uuid())
  productId       String    @map("product_id")
  variantName     String    @map("variant_name")
  variantValue    String    @map("variant_value")
  priceModifier   Decimal?  @map("price_modifier") @db.Decimal(10, 2)
  sku             String?
  stock           Int?
  
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_variants")
}

model Job {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  productId       String?   @map("product_id")
  jobType         String    @map("job_type")
  status          String    @default("pending")
  progress        Int       @default(0)
  errorMessage    String?   @map("error_message") @db.Text
  createdAt       DateTime  @default(now()) @map("created_at")
  completedAt     DateTime? @map("completed_at")
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  product         Product?  @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@map("jobs")
}
```

---

## API Endpoint'leri

### Authentication Endpoints
```
POST   /api/auth/register          # Kullanıcı kaydı
POST   /api/auth/login             # Kullanıcı girişi
POST   /api/auth/logout            # Çıkış
POST   /api/auth/refresh           # Token yenileme
GET    /api/auth/profile           # Kullanıcı profili
```

### Product Scraping Endpoints
```
POST   /api/scraper/analyze        # URL analizi (platform tespiti)
POST   /api/scraper/scrape         # Ürün scraping başlat
GET    /api/scraper/status/:jobId  # Scraping durumu
```

### AI Content Generation Endpoints
```
POST   /api/ai-content/generate    # İçerik üretimi (title, description, tags)
POST   /api/ai-content/regenerate  # İçerik yeniden üretimi
POST   /api/ai-content/improve     # İçerik iyileştirme
```

### Product Management Endpoints
```
GET    /api/products               # Tüm ürünleri listele
GET    /api/products/:id           # Tek ürün detayı
POST   /api/products               # Yeni ürün oluştur
PUT    /api/products/:id           # Ürün güncelle
DELETE /api/products/:id           # Ürün sil
PATCH  /api/products/:id/status    # Ürün durumu güncelle
```

### Image Management Endpoints
```
POST   /api/images/upload          # Görsel yükleme
POST   /api/images/process         # Görsel işleme (crop, resize, etc.)
DELETE /api/images/:id             # Görsel silme
PUT    /api/images/reorder         # Görsel sıralama
POST   /api/images/remove-bg       # Arka plan kaldırma
```

### Etsy Integration Endpoints
```
GET    /api/etsy/auth              # Etsy OAuth başlat
GET    /api/etsy/callback          # OAuth callback
GET    /api/etsy/shop              # Shop bilgileri
POST   /api/etsy/listings          # Listing oluştur
PUT    /api/etsy/listings/:id      # Listing güncelle
GET    /api/etsy/listings/:id      # Listing detayı
DELETE /api/etsy/listings/:id      # Listing sil
```

### Jobs & Queue Endpoints
```
GET    /api/jobs                   # Tüm jobları listele
GET    /api/jobs/:id               # Job durumu
DELETE /api/jobs/:id               # Job iptal et
```

---

## Deployment Stratejisi

### Development Environment
```yaml
# docker-compose.yml

version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@postgres:5432/etsy_db
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=etsy_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Production Deployment

**Frontend (Vercel):**
1. GitHub repo'ya push
2. Vercel'e import
3. Environment variables ayarla
4. Auto deploy aktif

**Backend (Railway/Render):**
1. Dockerfile kullanarak deploy
2. PostgreSQL addon ekle (veya Airtable kullan)
3. Redis addon ekle
4. Environment variables ayarla

**Environment Variables:**

**.env.backend:**
```bash
# App
NODE_ENV=production
PORT=3001
API_URL=https://api.yourdomain.com

# Database (PostgreSQL veya Airtable)
DATABASE_URL=postgresql://...
# VEYA
AIRTABLE_API_KEY=your_key
AIRTABLE_BASE_ID=your_base_id

# Redis
REDIS_URL=redis://...

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Etsy
ETSY_API_KEY=your_key
ETSY_SECRET=your_secret
ETSY_CALLBACK_URL=https://api.yourdomain.com/api/etsy/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Remove.bg (Optional)
REMOVEBG_API_KEY=your_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

**.env.frontend:**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret
```

---

## Güvenlik Önlemleri

1. **Authentication:**
   - JWT token tabanlı
   - Refresh token rotation
   - Rate limiting

2. **API Security:**
   - CORS configuration
   - Helmet.js
   - Input validation (class-validator)
   - SQL injection protection (Prisma ORM)

3. **File Upload:**
   - File type validation
   - File size limits
   - Virus scanning (optional)

4. **Etsy API:**
   - Secure OAuth flow
   - Token encryption
   - Rate limit handling

---

## Performans Optimizasyonları

1. **Caching:**
   - Redis cache
   - CDN (Cloudinary)
   - Next.js automatic caching

2. **Database:**
   - Query optimization
   - Indexing
   - Connection pooling

3. **Queue System:**
   - BullMQ for background jobs
   - Job prioritization
   - Retry mechanisms

4. **Frontend:**
   - Image optimization
   - Code splitting
   - Lazy loading
   - React Query caching

---

## Monitoring & Logging

1. **Error Tracking:**
   - Sentry integration
   - Error boundaries (React)
   - Global exception filters (NestJS)

2. **Logging:**
   - Winston logger
   - Structured logging
   - Log levels (error, warn, info, debug)

3. **Metrics:**
   - API response times
   - Job queue metrics
   - Database query performance

---

## Sonraki Adımlar

1. **Phase 1 - MVP:**
   - ✅ Sistem mimarisi ve klasör yapısı (Bu doküman)
   - ⬜ Backend kurulumu (NestJS + Airtable)
   - ⬜ Frontend kurulumu (Next.js + shadcn/ui)
   - ⬜ AliExpress scraper
   - ⬜ OpenAI entegrasyonu
   - ⬜ Etsy API entegrasyonu
   - ⬜ Temel görsel işleme

2. **Phase 2 - Geliştirme:**
   - ⬜ Bulk upload
   - ⬜ Amazon/Temu scraper
   - ⬜ Otomatik fiyatlandırma
   - ⬜ Analytics dashboard

3. **Phase 3 - Video Üretimi:**
   - ⬜ Görsellerden video oluşturma
   - ⬜ TikTok/Instagram Reels entegrasyonu

---

## Kaynaklar

- **Etsy API:** https://developers.etsy.com/
- **OpenAI API:** https://platform.openai.com/docs
- **Airtable API:** https://airtable.com/developers/web/api/introduction
- **NestJS:** https://docs.nestjs.com/
- **Next.js:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com/
- **Playwright:** https://playwright.dev/
- **BullMQ:** https://docs.bullmq.io/
- **Cloudinary:** https://cloudinary.com/documentation

---

**Bu doküman production-ready bir Etsy dropshipping otomasyonu için tam sistem mimarisi ve klasör yapısını içermektedir. Airtable (Atigravity) entegrasyonu ile hızlı prototip geliştirme ve ölçeklenebilir bir yapı sunmaktadır.**
