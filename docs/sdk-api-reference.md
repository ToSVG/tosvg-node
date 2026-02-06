# ToSVG SDK API Reference

> **Version:** 1.0.0
> **Base URL:** `https://tosvg.com/api/v1`
> **Last Updated:** February 2026

Bu dokümantasyon, ToSVG API üzerinden SDK geliştirmek isteyen ekip üyeleri için hazırlanmıştır. Her endpoint'in parametreleri, validasyon kuralları, response formatları ve hata kodları detaylı olarak belgelenmiştir.

---

## İçindekiler

1. [Genel Bilgiler](#1-genel-bilgiler)
2. [Kimlik Doğrulama (Authentication)](#2-kimlik-doğrulama-authentication)
3. [Endpoint'ler](#3-endpointler)
    - 3.1 [Image to SVG Conversion](#31-image-to-svg-conversion)
    - 3.2 [Remove Background](#32-remove-background)
    - 3.3 [Image Resize](#33-image-resize)
4. [Bilgi Endpoint'leri (Auth Gerektirmeyen)](#4-bilgi-endpointleri-auth-gerektirmeyen)
    - 4.1 [API Info](#41-api-info)
    - 4.2 [Health Check](#42-health-check)
    - 4.3 [Supported Formats](#43-supported-formats)
    - 4.4 [Background Removal Models](#44-background-removal-models)
    - 4.5 [Resize Limits](#45-resize-limits)
5. [Rate Limiting](#5-rate-limiting)
6. [Hata Kodları](#6-hata-kodları)
7. [Response Formatı](#7-response-formatı)
8. [SDK Tasarım Rehberi](#8-sdk-tasarım-rehberi)
9. [Planlanan SDK'lar](#9-planlanan-sdklar)

---

## 1. Genel Bilgiler

### Base URL

```
https://tosvg.com/api/v1
```

### Content Type

Tüm POST endpoint'leri `multipart/form-data` formatında dosya yüklemesi bekler. GET endpoint'leri JSON response döner.

### Desteklenen Giriş Formatları

| Format | Uzantı          | Max Boyut |
| ------ | --------------- | --------- |
| PNG    | `.png`          | 10MB      |
| JPEG   | `.jpg`, `.jpeg` | 10MB      |
| BMP    | `.bmp`          | 10MB      |
| GIF    | `.gif`          | 10MB      |
| TIFF   | `.tiff`         | 10MB      |
| WebP   | `.webp`         | 10MB      |

### Genel Limitler

| Parametre         | Değer                            |
| ----------------- | -------------------------------- |
| Max dosya boyutu  | 10MB (10240KB)                   |
| Max görsel boyutu | 4096×4096 px                     |
| API key prefix    | `tosvg_live_` veya `tosvg_test_` |

---

## 2. Kimlik Doğrulama (Authentication)

### API Key Formatı

```
tosvg_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- Prefix: `tosvg`
- Ortam: `live` (production) veya `test` (sandbox)
- Identifier: 32 karakter rastgele string

### API Key Gönderim Yöntemleri (Öncelik Sırasına Göre)

SDK'da bu 3 yöntem desteklenmeli, tercih sırası aşağıdaki gibidir:

| Öncelik | Yöntem           | Header / Parametre                     | Önerilen                  |
| ------- | ---------------- | -------------------------------------- | ------------------------- |
| 1       | X-API-Key Header | `X-API-Key: tosvg_live_xxx`            | ✅ Evet                   |
| 2       | Bearer Token     | `Authorization: Bearer tosvg_live_xxx` | ✅ Evet                   |
| 3       | Query Parameter  | `?api_key=tosvg_live_xxx`              | ❌ Hayır (güvenlik riski) |

### SDK'da Kimlik Doğrulama Örneği

```
Client oluşturulurken API key parametre olarak alınmalı.
Her request'te X-API-Key header'ı otomatik eklenmeli.
```

---

## 3. Endpoint'ler

### 3.1 Image to SVG Conversion

Raster görsel dosyalarını vektör SVG formatına dönüştürür.

**Endpoint:** `POST /api/v1/convert/image-to-svg`
**Auth:** ✅ Gerekli
**Content-Type:** `multipart/form-data`

#### Request Parametreleri

| Parametre                   | Tip       | Zorunlu | Varsayılan | Açıklama                                            | Validasyon                |
| --------------------------- | --------- | ------- | ---------- | --------------------------------------------------- | ------------------------- |
| `image`                     | `file`    | ✅      | -          | Görsel dosya (PNG, JPG, JPEG, BMP, GIF, TIFF, WebP) | `image\|max:10240`        |
| `options[color_mode]`       | `string`  | ❌      | `color`    | Renk modu                                           | Enum: `color`, `bw`       |
| `options[mode]`             | `string`  | ❌      | `polygon`  | Dönüştürme algoritması                              | Enum: `polygon`, `spline` |
| `options[filter_speckle]`   | `integer` | ❌      | `8`        | Gürültü filtresi boyutu                             | Min: `0`, Max: `20`       |
| `options[corner_threshold]` | `integer` | ❌      | `30`       | Köşe eşik açısı (derece)                            | Min: `0`, Max: `180`      |
| `options[color_precision]`  | `integer` | ❌      | `4`        | Renk hassasiyeti (yüksek = daha fazla renk)         | Min: `1`, Max: `10`       |

#### `options[color_mode]` Değerleri

| Değer   | Açıklama                       |
| ------- | ------------------------------ |
| `color` | Renkli SVG çıktısı üretir      |
| `bw`    | Siyah-beyaz SVG çıktısı üretir |

#### `options[mode]` Değerleri

| Değer     | Açıklama                                  |
| --------- | ----------------------------------------- |
| `polygon` | Keskin kenarlı poligon tabanlı dönüştürme |
| `spline`  | Yumuşak eğrili spline tabanlı dönüştürme  |

#### Başarılı Response (200)

```json
{
    "success": true,
    "data": {
        "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...>...</svg>",
        "file_size": 15234,
        "conversion_time": 0.85
    }
}
```

| Alan                   | Tip       | Açıklama                     |
| ---------------------- | --------- | ---------------------------- |
| `data.svg`             | `string`  | SVG içeriği (ham XML string) |
| `data.file_size`       | `integer` | SVG dosya boyutu (byte)      |
| `data.conversion_time` | `float`   | Dönüştürme süresi (saniye)   |

#### SDK Method İmzası

```
imageToSvg(image: File, options?: ImageToSvgOptions): Promise<ImageToSvgResult>
```

```
ImageToSvgOptions {
  colorMode?: 'color' | 'bw'       // default: 'color'
  mode?: 'polygon' | 'spline'      // default: 'polygon'
  filterSpeckle?: number            // 0-20, default: 8
  cornerThreshold?: number          // 0-180, default: 30
  colorPrecision?: number           // 1-10, default: 4
}

ImageToSvgResult {
  svg: string
  fileSize: number
  conversionTime: number
}
```

---

### 3.2 Remove Background

Görsellerden arka planı yapay zeka modelleri ile kaldırır.

**Endpoint:** `POST /api/v1/background/remove`
**Auth:** ✅ Gerekli
**Content-Type:** `multipart/form-data`

#### Request Parametreleri

| Parametre       | Tip       | Zorunlu | Varsayılan | Açıklama                                | Validasyon                                                       |
| --------------- | --------- | ------- | ---------- | --------------------------------------- | ---------------------------------------------------------------- |
| `image`         | `file`    | ✅      | -          | Görsel dosya (JPEG, PNG, JPG)           | `image\|mimes:jpeg,png,jpg\|max:10240`                           |
| `provider`      | `string`  | ❌      | `rembg`    | Arka plan kaldırma sağlayıcı            | Enum: `rembg`, `withoutbg`                                       |
| `model`         | `string`  | ❌      | `u2net`    | AI modeli (sadece `rembg` provider ile) | Enum: `u2net`, `silueta`, `u2net_human_seg`, `isnet-general-use` |
| `format`        | `string`  | ❌      | `png`      | Çıktı formatı                           | Enum: `png`, `jpg`, `jpeg`                                       |
| `return_base64` | `boolean` | ❌      | `false`    | Base64 encode olarak döndür             | `true` veya `false`                                              |

#### `provider` Değerleri

| Değer       | Açıklama                           |
| ----------- | ---------------------------------- |
| `rembg`     | Varsayılan, model seçimi destekler |
| `withoutbg` | Alternatif sağlayıcı               |

#### `model` Değerleri (Sadece `provider=rembg` ile)

| Değer               | Açıklama                          |
| ------------------- | --------------------------------- |
| `u2net`             | Genel amaçlı (varsayılan)         |
| `silueta`           | Hızlı, hafif model                |
| `u2net_human_seg`   | İnsan segmentasyonu için optimize |
| `isnet-general-use` | Genel kullanım, yüksek doğruluk   |

#### Başarılı Response — Dosya Yolu (200, `return_base64=false`)

```json
{
    "success": true,
    "data": {
        "filename": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.png",
        "path": "removed-background/a1b2c3d4-e5f6-7890-abcd-ef1234567890.png",
        "file_size": 56780,
        "processing_time": 1.23,
        "provider": "rembg"
    }
}
```

#### Başarılı Response — Base64 (200, `return_base64=true`)

```json
{
    "success": true,
    "data": {
        "image": "iVBORw0KGgoAAAANSUhEUgAA...",
        "format": "png",
        "file_size": 56780,
        "processing_time": 1.23,
        "provider": "rembg"
    }
}
```

| Alan                   | Tip       | Koşul                 | Açıklama                      |
| ---------------------- | --------- | --------------------- | ----------------------------- |
| `data.filename`        | `string`  | `return_base64=false` | Oluşturulan dosya adı (UUID)  |
| `data.path`            | `string`  | `return_base64=false` | Dosya yolu (storage relative) |
| `data.image`           | `string`  | `return_base64=true`  | Base64 encoded görsel         |
| `data.format`          | `string`  | `return_base64=true`  | Çıktı formatı                 |
| `data.file_size`       | `integer` | Her zaman             | Dosya boyutu (byte)           |
| `data.processing_time` | `float`   | Her zaman             | İşlem süresi (saniye)         |
| `data.provider`        | `string`  | Her zaman             | Kullanılan sağlayıcı          |

#### SDK Method İmzası

```
removeBackground(image: File, options?: RemoveBackgroundOptions): Promise<RemoveBackgroundResult>
```

```
RemoveBackgroundOptions {
  provider?: 'rembg' | 'withoutbg'                                          // default: 'rembg'
  model?: 'u2net' | 'silueta' | 'u2net_human_seg' | 'isnet-general-use'     // default: 'u2net'
  format?: 'png' | 'jpg' | 'jpeg'                                           // default: 'png'
  returnBase64?: boolean                                                      // default: false
}

RemoveBackgroundResult {
  // return_base64=false durumunda:
  filename?: string
  path?: string

  // return_base64=true durumunda:
  image?: string       // base64 encoded
  format?: string

  // Her zaman:
  fileSize: number
  processingTime: number
  provider: string
}
```

---

### 3.3 Image Resize

Görselleri belirtilen boyutlara yeniden boyutlandırır.

**Endpoint:** `POST /api/v1/resize/image`
**Auth:** ✅ Gerekli
**Content-Type:** `multipart/form-data`

#### Request Parametreleri

| Parametre               | Tip       | Zorunlu | Varsayılan | Açıklama                 | Validasyon                         |
| ----------------------- | --------- | ------- | ---------- | ------------------------ | ---------------------------------- |
| `image`                 | `file`    | ✅      | -          | Görsel dosya             | `image\|max:10240`                 |
| `width`                 | `integer` | ✅      | -          | Hedef genişlik (piksel)  | Min: `1`, Max: `4096`              |
| `height`                | `integer` | ✅      | -          | Hedef yükseklik (piksel) | Min: `1`, Max: `4096`              |
| `quality`               | `integer` | ❌      | `90`       | Çıktı kalitesi           | Min: `1`, Max: `100`               |
| `format`                | `string`  | ❌      | `png`      | Çıktı formatı            | Enum: `png`, `jpg`, `jpeg`, `webp` |
| `maintain_aspect_ratio` | `boolean` | ❌      | `true`     | En-boy oranını koru      | `true` veya `false`                |

#### Başarılı Response (200)

```json
{
    "success": true,
    "data": {
        "path": "resized/a1b2c3d4.png",
        "size": 45200,
        "dimensions": {
            "width": 800,
            "height": 600
        },
        "quality": 90,
        "format": "png",
        "processing_time": 0.45
    }
}
```

| Alan                     | Tip       | Açıklama                 |
| ------------------------ | --------- | ------------------------ |
| `data.path`              | `string`  | Oluşturulan dosya yolu   |
| `data.size`              | `integer` | Dosya boyutu (byte)      |
| `data.dimensions.width`  | `integer` | Çıktı genişliği (px)     |
| `data.dimensions.height` | `integer` | Çıktı yüksekliği (px)    |
| `data.quality`           | `integer` | Kullanılan kalite değeri |
| `data.format`            | `string`  | Çıktı formatı            |
| `data.processing_time`   | `float`   | İşlem süresi (saniye)    |

#### SDK Method İmzası

```
resizeImage(image: File, options: ResizeImageOptions): Promise<ResizeImageResult>
```

```
ResizeImageOptions {
  width: number                                    // zorunlu, 1-4096
  height: number                                   // zorunlu, 1-4096
  quality?: number                                 // 1-100, default: 90
  format?: 'png' | 'jpg' | 'jpeg' | 'webp'        // default: 'png'
  maintainAspectRatio?: boolean                    // default: true
}

ResizeImageResult {
  path: string
  size: number
  dimensions: { width: number, height: number }
  quality: number
  format: string
  processingTime: number
}
```

---

## 4. Bilgi Endpoint'leri (Auth Gerektirmeyen)

Bu endpoint'ler herkese açıktır, API key gerektirmez.

### 4.1 API Info

**Endpoint:** `GET /api/v1/`
**Auth:** ❌

#### Response (200)

```json
{
    "success": true,
    "message": "ToSVG API v1",
    "version": "1.0.0",
    "base_url": "https://tosvg.com/api/v1",
    "documentation": "https://tosvg.com/api",
    "endpoints": {
        "health": "/api/v1/health",
        "test": "/api/v1/test",
        "convert": {
            "image_to_svg": "/api/v1/convert/image-to-svg",
            "supported_formats": "/api/v1/convert/supported-formats"
        },
        "background": {
            "remove": "/api/v1/background/remove",
            "models": "/api/v1/background/models"
        },
        "resize": {
            "image": "/api/v1/resize/image",
            "limits": "/api/v1/resize/limits"
        }
    },
    "rate_limits": {
        "convert": "10 requests per hour",
        "background": "5 requests per hour",
        "resize": "15 requests per hour"
    }
}
```

---

### 4.2 Health Check

**Endpoint:** `GET /api/v1/health`
**Auth:** ❌

#### Response (200)

```json
{
    "success": true,
    "status": "healthy",
    "timestamp": "2026-02-06T12:00:00.000000Z",
    "services": {
        "image_conversion": "operational",
        "background_removal": "operational",
        "image_resize": "operational"
    }
}
```

---

### 4.3 Supported Formats

**Endpoint:** `GET /api/v1/convert/supported-formats`
**Auth:** ✅ Gerekli

#### Response (200)

```json
{
    "success": true,
    "data": {
        "formats": {
            "png": { "max_size": "10MB", "description": "PNG image format" },
            "jpg": { "max_size": "10MB", "description": "JPEG image format" },
            "jpeg": { "max_size": "10MB", "description": "JPEG image format" },
            "bmp": { "max_size": "10MB", "description": "BMP image format" },
            "gif": { "max_size": "10MB", "description": "GIF image format" },
            "tiff": { "max_size": "10MB", "description": "TIFF image format" },
            "webp": { "max_size": "10MB", "description": "WebP image format" }
        },
        "max_dimensions": "4096x4096 pixels",
        "max_file_size": "10MB"
    }
}
```

---

### 4.4 Background Removal Models

**Endpoint:** `GET /api/v1/background/models`
**Auth:** ✅ Gerekli

#### Query Parametreleri

| Parametre  | Tip      | Zorunlu | Varsayılan           | Açıklama          |
| ---------- | -------- | ------- | -------------------- | ----------------- |
| `provider` | `string` | ❌      | (sistem varsayılanı) | Provider filtresi |

#### Response (200)

```json
{
    "success": true,
    "data": {
        "provider": "rembg",
        "models": ["u2net", "silueta", "u2net_human_seg", "isnet-general-use"],
        "available_providers": ["rembg", "withoutbg"],
        "default_provider": "rembg",
        "supported_formats": ["png", "jpg", "jpeg"]
    }
}
```

---

### 4.5 Resize Limits

**Endpoint:** `GET /api/v1/resize/limits`
**Auth:** ✅ Gerekli

#### Response (200)

```json
{
    "success": true,
    "data": {
        "max_dimensions": { "width": 4096, "height": 4096 },
        "min_dimensions": { "width": 1, "height": 1 },
        "max_file_size": "10MB",
        "supported_formats": ["png", "jpg", "jpeg", "webp"],
        "quality_range": { "min": 1, "max": 100, "default": 90 }
    }
}
```

---

## 5. Rate Limiting

### Abonelik Bazlı Rate Limiting (Authenticated Endpoints)

Authenticated endpoint'ler, kullanıcının planına göre günlük limit uygulanır:

| Plan       | Günlük Limit  | Aylık Fiyat | Yıllık Fiyat        |
| ---------- | ------------- | ----------- | ------------------- |
| Free       | 100 istek     | $0          | -                   |
| Starter    | 1,000 istek   | $9          | $86.40 ($7.20/ay)   |
| Pro        | 10,000 istek  | $29         | $278.40 ($23.20/ay) |
| Enterprise | 100,000 istek | $99         | $950.40 ($79.20/ay) |

### Legacy Rate Limiting (IP Bazlı, /api/v1/legacy/\*)

| Endpoint          | Limit           |
| ----------------- | --------------- |
| Image to SVG      | 10 istek / saat |
| Remove Background | 5 istek / saat  |
| Image Resize      | 15 istek / saat |
| Diğer             | 20 istek / saat |

### Rate Limit Response Headers

Her authenticated response'ta aşağıdaki header'lar döner:

| Header                  | Tip       | Açıklama                             | Örnek        |
| ----------------------- | --------- | ------------------------------------ | ------------ |
| `X-RateLimit-Limit`     | `integer` | Plan bazlı maksimum günlük istek     | `1000`       |
| `X-RateLimit-Remaining` | `integer` | Mevcut dönemde kalan istek           | `847`        |
| `X-RateLimit-Reset`     | `integer` | Limitin sıfırlanacağı Unix timestamp | `1706860800` |
| `X-Response-Time`       | `string`  | Sunucu işlem süresi                  | `245ms`      |

### Rate Limit Aşımı Response (429)

```json
{
    "success": false,
    "message": "Rate limit exceeded. Please try again later.",
    "retry_after": 3600,
    "limit": 10,
    "window": 60
}
```

SDK'da bu header'lar parse edilmeli ve kullanıcıya sunulmalıdır.

---

## 6. Hata Kodları

### Genel Response Formatı — Hata

```json
{
    "success": false,
    "message": "Human-readable error message",
    "errors": {
        "field_name": ["Validation error detail"]
    }
}
```

### HTTP Status Kodları ve Hata Detayları

#### 401 — Unauthorized

| Error Code         | Mesaj                            | Açıklama                      |
| ------------------ | -------------------------------- | ----------------------------- |
| `MISSING_API_KEY`  | API key is required              | Header'da API key yok         |
| `INVALID_API_KEY`  | The provided API key is invalid  | Geçersiz API key              |
| `EXPIRED_API_KEY`  | The API key has expired          | Süresi dolmuş API key         |
| `INACTIVE_API_KEY` | The API key has been deactivated | Devre dışı bırakılmış API key |

#### 403 — Forbidden

| Error Code              | Mesaj                              | Açıklama                   |
| ----------------------- | ---------------------------------- | -------------------------- |
| `IP_RESTRICTED`         | Your IP address is not allowed     | IP whitelist'te olmayan IP |
| `SUBSCRIPTION_REQUIRED` | An active subscription is required | Aktif abonelik gerekli     |

#### 422 — Validation Error

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "image": ["The image field is required."],
        "width": ["The width must be between 1 and 4096."],
        "options.color_mode": ["The selected options.color_mode is invalid."]
    }
}
```

#### 429 — Too Many Requests

| Error Code            | Mesaj                     | Açıklama            |
| --------------------- | ------------------------- | ------------------- |
| `RATE_LIMIT_EXCEEDED` | Daily rate limit exceeded | Günlük limit aşıldı |

#### 400 — Bad Request

| Error Code           | Mesaj                     | Açıklama              |
| -------------------- | ------------------------- | --------------------- |
| `VALIDATION_ERROR`   | Request validation failed | Geçersiz parametre    |
| `UNSUPPORTED_FORMAT` | File format not supported | Desteklenmeyen format |
| `FILE_TOO_LARGE`     | File exceeds maximum size | 10MB üzeri dosya      |

#### 500 — Internal Server Error

| Error Code            | Mesaj                           | Açıklama                  |
| --------------------- | ------------------------------- | ------------------------- |
| `INTERNAL_ERROR`      | An unexpected error occurred    | Beklenmeyen sunucu hatası |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | Geçici servis kesintisi   |

---

## 7. Response Formatı

### Başarılı Response Yapısı

```json
{
  "success": true,
  "data": { ... }
}
```

### Hata Response Yapısı

```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

SDK'da response'lar bu yapıya göre parse edilmeli. `success` alanı `boolean` olup, response durumunu belirler.

---

## 8. SDK Tasarım Rehberi

### Önerilen SDK Yapısı

Her SDK aşağıdaki bileşenleri içermelidir:

#### 8.1 Client Sınıfı

```
class ToSVGClient:
  constructor(apiKey: string, options?: ClientOptions)

  ClientOptions:
    baseUrl?: string          // default: 'https://tosvg.com/api/v1'
    timeout?: number          // default: 30000 (ms)
    retryOnRateLimit?: boolean // default: true
    maxRetries?: number       // default: 3
```

#### 8.2 Metodlar

| Method                  | Endpoint                         | Açıklama                |
| ----------------------- | -------------------------------- | ----------------------- |
| `imageToSvg()`          | `POST /convert/image-to-svg`     | Görsel → SVG dönüşümü   |
| `removeBackground()`    | `POST /background/remove`        | Arka plan kaldırma      |
| `resizeImage()`         | `POST /resize/image`             | Görsel boyutlandırma    |
| `getSupportedFormats()` | `GET /convert/supported-formats` | Desteklenen formatlar   |
| `getModels()`           | `GET /background/models`         | Mevcut AI modelleri     |
| `getResizeLimits()`     | `GET /resize/limits`             | Boyutlandırma limitleri |
| `healthCheck()`         | `GET /health`                    | Servis durumu           |

#### 8.3 Hata Yönetimi

SDK'da aşağıdaki exception/error sınıfları tanımlanmalı:

| Exception Sınıfı      | HTTP Kodu | Tetikleyici                   |
| --------------------- | --------- | ----------------------------- |
| `AuthenticationError` | 401       | Geçersiz/eksik API key        |
| `ForbiddenError`      | 403       | IP kısıtlaması / abonelik yok |
| `ValidationError`     | 422       | Geçersiz parametre            |
| `RateLimitError`      | 429       | Rate limit aşımı              |
| `BadRequestError`     | 400       | Hatalı istek                  |
| `ServerError`         | 500       | Sunucu hatası                 |
| `NetworkError`        | -         | Bağlantı hatası / timeout     |

#### 8.4 Rate Limit Handling

SDK otomatik olarak:

1. Response header'lardan `X-RateLimit-*` değerlerini parse etmeli
2. 429 döndüğünde `Retry-After` değeri kadar bekleyip tekrar denemeli
3. Kullanıcıya kalan istek sayısını sorgulama imkanı sunmalı

```
client.getRateLimitInfo(): { limit: number, remaining: number, resetAt: Date }
```

#### 8.5 Parametre İsimlendirme Kuralları

API'deki `snake_case` parametreler, SDK'da dilin convention'ına uygun dönüştürülmeli:

| API Parametresi         | JavaScript (camelCase) | Python (snake_case)     | PHP (camelCase)       |
| ----------------------- | ---------------------- | ----------------------- | --------------------- |
| `color_mode`            | `colorMode`            | `color_mode`            | `colorMode`           |
| `filter_speckle`        | `filterSpeckle`        | `filter_speckle`        | `filterSpeckle`       |
| `corner_threshold`      | `cornerThreshold`      | `corner_threshold`      | `cornerThreshold`     |
| `color_precision`       | `colorPrecision`       | `color_precision`       | `colorPrecision`      |
| `return_base64`         | `returnBase64`         | `return_base64`         | `returnBase64`        |
| `maintain_aspect_ratio` | `maintainAspectRatio`  | `maintain_aspect_ratio` | `maintainAspectRatio` |
| `processing_time`       | `processingTime`       | `processing_time`       | `processingTime`      |
| `file_size`             | `fileSize`             | `file_size`             | `fileSize`            |

---

## 9. Planlanan SDK'lar

### Paket Bilgileri

| Dil        | Paket Adı                   | Install Komutu                     | Durum          |
| ---------- | --------------------------- | ---------------------------------- | -------------- |
| JavaScript | `tosvg-api`                 | `npm install tosvg-api`            | 📋 Planlanıyor |
| Python     | `tosvg`                     | `pip install tosvg`                | 📋 Planlanıyor |
| PHP        | `tosvg/tosvg-php`           | `composer require tosvg/tosvg-php` | 📋 Planlanıyor |
| Go         | `github.com/tosvg/tosvg-go` | `go get github.com/tosvg/tosvg-go` | 🔮 Yakında     |
| Ruby       | `tosvg`                     | `gem install tosvg`                | 🔮 Yakında     |
| Java       | `com.tosvg:tosvg-java`      | Maven / Gradle                     | 🔮 Yakında     |

### SDK Minimum Gereksinimleri

Her SDK aşağıdaki özellikleri desteklemelidir:

- [x] API Key ile kimlik doğrulama (X-API-Key header)
- [x] 3 ana endpoint desteği (convert, background, resize)
- [x] Bilgi endpoint'leri (formats, models, limits, health)
- [x] Otomatik rate limit handling (retry with backoff)
- [x] Kapsamlı hata yönetimi (typed exceptions)
- [x] Response header parse (rate limit bilgileri)
- [x] Dosya yükleme (multipart/form-data)
- [x] Base64 response desteği (remove background)
- [x] Timeout konfigürasyonu
- [x] TypeScript type tanımları (JS SDK için)

---

## Ek: Middleware Zinciri

Authenticated endpoint'ler şu middleware sırasıyla işlenir:

```
Request
  → ApiKeyAuthentication    (X-API-Key doğrulama)
  → ApiIpRestriction        (IP whitelist kontrolü)
  → SubscriptionRateLimit   (Plan bazlı günlük limit)
  → ApiUsageLogging         (Request/response loglama)
  → Controller
  → Response
```

Bu sıralama SDK tarafında hata yönetimi için önemlidir:

1. İlk olarak 401 (auth hatası) dönebilir
2. Sonra 403 (IP kısıtlaması) dönebilir
3. Sonra 429 (rate limit) dönebilir
4. Son olarak 422/400/500 (iş mantığı hataları) dönebilir
