# TOTP Integration - File Structure & Changes

## Complete Project Structure After Integration

```
Sritha Oils/
├── README.md                                    (Original)
├── pom.xml                                      ✏️ MODIFIED (Added dependencies)
├── DEPLOYMENT_GUIDE.md                          📄 NEW
├── TOTP_INTEGRATION_SUMMARY.md                  📄 NEW
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/srithaoils/backend/
│       │       ├── config/
│       │       │   └── DataInitializer.java     (Original)
│       │       ├── controller/
│       │       │   └── AuthController.java      ✏️ MODIFIED
│       │       ├── dto/
│       │       │   └── auth/
│       │       │       ├── AuthResponse.java           (Original)
│       │       │       ├── OtpRequestRequest.java      (Original)
│       │       │       ├── OtpRequestResponse.java     (Original)
│       │       │       ├── OtpVerifyRequest.java       (Original)
│       │       │       ├── RegisterRequest.java        (Original)
│       │       │       ├── TotpSetupRequest.java       📄 NEW
│       │       │       ├── TotpSetupResponse.java      📄 NEW
│       │       │       ├── TotpSetupVerifyRequest.java 📄 NEW
│       │       │       └── TotpVerifyRequest.java      📄 NEW
│       │       ├── entity/
│       │       │   └── User.java                ✏️ MODIFIED (Added TOTP fields)
│       │       ├── repository/
│       │       │   └── (Original repositories)
│       │       └── service/
│       │           ├── AuthService.java         ✏️ MODIFIED (Added TOTP methods)
│       │           ├── OtpStore.java            (Original)
│       │           └── TotpService.java         📄 NEW
│       │
│       └── resources/
│           ├── application.properties           (Original)
│           ├── db/
│           │   └── migration/
│           │       ├── V1__create_postgresql_schema.sql    (Original)
│           │       └── V2__add_totp_fields.sql             📄 NEW
│           └── ...other resources...
│
├── frontend/
│   ├── package.json                            (Original)
│   ├── vite.config.js                          (Original)
│   ├── src/
│   │   ├── App.jsx                             (Original)
│   │   ├── main.jsx                            (Original)
│   │   ├── components/
│   │   │   ├── AddressSelectionCard.jsx        (Original)
│   │   │   ├── CartIcon.jsx                    (Original)
│   │   │   ├── CartItemsList.jsx               (Original)
│   │   │   ├── CheckoutPanel.jsx               (Original)
│   │   │   ├── FlowSteps.jsx                   (Original)
│   │   │   ├── Footer.jsx                      (Original)
│   │   │   ├── Header.jsx                      (Original)
│   │   │   ├── InlineSpinner.jsx               (Original)
│   │   │   ├── OtpInputField.jsx               (Original)
│   │   │   ├── OtherComponents...              (Original)
│   │   │   ├── QrCodeDisplay.jsx               📄 NEW
│   │   │   └── TotpSetupCard.jsx               📄 NEW
│   │   ├── context/
│   │   │   └── StorefrontContext.jsx           ✏️ MODIFIED (Added TOTP state & methods)
│   │   ├── hooks/
│   │   │   └── useStorefront.js                (Original)
│   │   ├── pages/
│   │   │   ├── CartPage.jsx                    (Original)
│   │   │   ├── CheckoutPage.jsx                (Original)
│   │   │   ├── LoginPage.jsx                   ✏️ MODIFIED (Added TOTP stage)
│   │   │   └── ...other pages...               (Original)
│   │   ├── services/
│   │   │   ├── authService.js                  ✏️ MODIFIED (Added TOTP API calls)
│   │   │   ├── addressService.js               (Original)
│   │   │   ├── orderService.js                 (Original)
│   │   │   └── ...other services...            (Original)
│   │   ├── styles/
│   │   │   ├── login-page.css                  (Original)
│   │   │   ├── totp.css                        📄 NEW
│   │   │   └── ...other styles...              (Original)
│   │   └── utils/
│   │       ├── auth.js                         (Original)
│   │       ├── routes.js                       (Original)
│   │       └── ...other utils...               (Original)
│   └── assets/                                 (Original)
│
└── docs/
    ├── postgresql-backend-design.md            (Original)
    ├── postgresql-sample-inserts.sql           (Original)
    └── totp-integration.md                     📄 NEW
```

## Legend
- 📄 **NEW** - File created for TOTP integration
- ✏️ **MODIFIED** - File updated to add TOTP functionality
- **(Original)** - Existing file, no changes

---

## Detailed Change Summary

### Backend Changes

#### 1. pom.xml
**Added Dependencies:**
```xml
<!-- Apache Commons Codec for Base32 encoding -->
<dependency>
    <groupId>commons-codec</groupId>
    <artifactId>commons-codec</artifactId>
    <version>1.16.0</version>
</dependency>

<!-- TOTP utilities -->
<dependency>
    <groupId>de.taimos</groupId>
    <artifactId>totp</artifactId>
    <version>1.0</version>
</dependency>
```

#### 2. User.java
**Added Fields:**
- `String totpSecret` - Stores Base32-encoded TOTP secret
- `boolean totpEnabled` - Tracks if TOTP is active
- `boolean totpSetupPending` - Temporary flag during setup

**Added Methods:**
- `getTotpSecret()` / `setTotpSecret()`
- `isTotpEnabled()` / `setTotpEnabled()`
- `isTotpSetupPending()` / `setTotpSetupPending()`

#### 3. TotpService.java (NEW)
**Methods:**
- `generateSecret()` - Creates new Base32-encoded secret
- `generateProvisioningUri()` - Generates QR code URI
- `verifyCode()` - Validates TOTP code with time drift tolerance

**Algorithm:**
- HMAC-SHA1 implementation
- 30-second time steps
- 6-digit codes
- ±30 second clock skew tolerance

#### 4. AuthService.java
**Added Methods:**
- `initiateTotpSetup(TotpSetupRequest)` - Start TOTP setup
- `verifyAndCompleteTotpSetup(TotpSetupVerifyRequest)` - Verify setup
- `verifyTotp(TotpVerifyRequest)` - Verify code during login

**Dependencies Injected:**
- `TotpService totpService`

#### 5. AuthController.java
**Added Endpoints:**
```
POST /api/auth/totp/setup/initiate
POST /api/auth/totp/setup/verify
POST /api/auth/verify-totp
```

#### 6. Database Migration (V2__add_totp_fields.sql)
**Schema Changes:**
```sql
ALTER TABLE users
ADD COLUMN totp_secret VARCHAR(255),
ADD COLUMN totp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN totp_setup_pending BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_users_totp_enabled ON users(totp_enabled);
```

#### 7. New DTOs
- `TotpSetupRequest.java` - Request to initiate setup
- `TotpSetupResponse.java` - Response with secret and QR code
- `TotpSetupVerifyRequest.java` - Verification during setup
- `TotpVerifyRequest.java` - Code verification during login

### Frontend Changes

#### 1. authService.js
**Added Functions:**
```javascript
initiateTotpSetup(phoneNumber)      // POST /api/auth/totp/setup/initiate
verifyTotpSetup(phoneNumber, code)  // POST /api/auth/totp/setup/verify
verifyTotpCode(phoneNumber, code)   // POST /api/auth/verify-totp
```

#### 2. StorefrontContext.jsx
**Added State Variables:**
- `totpSecret` - Current TOTP secret
- `totpQrCodeUri` - QR code provisioning URI
- `totpSetupPending` - Setup status flag

**Added Methods:**
- `setupTotp()` - Initiate TOTP setup
- `completeTotpSetup(code)` - Complete and verify setup
- `verifyTotp(code)` - Verify TOTP code for login

**Updated Methods:**
- `resetAuthFlow()` - Now resets TOTP state
- Context value export - Added TOTP functions

#### 3. LoginPage.jsx
**Added Imports:**
- `TotpSetupCard` component
- Additional TOTP functions from context

**Added Stage:**
- `'totp-setup'` - New authentication stage

**Updated Components:**
- `StageIndicator` - Now includes TOTP stage
- `handleVerifyOtpValue()` - Transitions to TOTP setup
- New handlers: `handleSetupTotp()`, `handleCompleteTotpSetup()`, `handleVerifyTotpCode()`

**New Render Section:**
```jsx
{authStage === 'totp-setup' ? (
  <TotpSetupCard ... />
) : null}
```

#### 4. QrCodeDisplay.jsx (NEW)
**Features:**
- Displays QR code image from qr-server.com
- Shows Base32 secret for manual entry
- Displays account info and issuer
- Responsive design

**Props:**
- `qrCodeUri` - Provisioning URI
- `secret` - Base32-encoded secret
- `phoneNumber` - User's phone number

#### 5. TotpSetupCard.jsx (NEW)
**Features:**
- Complete TOTP setup UI
- Step-by-step instructions
- QR code display via QrCodeDisplay
- 6-digit code input field
- Cancel and verify buttons
- Loading states and error handling

**Props:**
- `phoneNumber` - User's phone
- `secret` - TOTP secret
- `qrCodeUri` - QR code provisioning URI
- `onVerifyCode()` - Callback for code verification
- `onCancel()` - Callback for cancellation
- `loading` - Loading state
- `error` - Error message
- `message` - Status message

#### 6. totp.css (NEW)
**Components Styled:**
- `.totp-setup-card` - Main card container
- `.qr-code-display` - QR code section
- `.secret-display` - Manual secret entry
- `.totp-verification-form` - Code input form
- `.login-stage--totp-setup` - Login page TOTP stage
- Responsive mobile design

---

## Integration Points

### API Flow
```
Frontend (React)
    ↓
authService.js (API calls)
    ↓
StorefrontContext.jsx (State management)
    ↓
LoginPage.jsx / TotpSetupCard.jsx (UI components)
    ↓↓
Backend (Spring Boot)
    ↓
AuthController.java (REST endpoints)
    ↓
AuthService.java (Business logic)
    ↓
TotpService.java (TOTP implementation)
    ↓
User.java Entity (Database mapping)
    ↓
PostgreSQL Database
```

### State Management Flow
```
User enters code
    ↓
TotpSetupCard.jsx (captures input)
    ↓
completeTotpSetup() (from context)
    ↓
StorefrontContext.jsx (manages state)
    ↓
authService.js (API call)
    ↓
AuthController (backend)
    ↓
TotpService (verification)
    ↓
Response → Update context → UI updates
```

---

## Testing Coverage Points

### Backend
- [ ] TotpService.generateSecret()
- [ ] TotpService.verifyCode()
- [ ] AuthService TOTP methods
- [ ] AuthController endpoints
- [ ] Database migration
- [ ] Error handling

### Frontend
- [ ] QrCodeDisplay renders correctly
- [ ] TotpSetupCard displays QR code
- [ ] Manual secret entry works
- [ ] Code input validation
- [ ] API call success/error handling
- [ ] State updates properly
- [ ] Responsive design on mobile

### Integration
- [ ] End-to-end auth flow
- [ ] New user registration with TOTP
- [ ] Existing user TOTP verification
- [ ] Error messages display correctly
- [ ] Navigation between stages
- [ ] Cancel/reset functionality

---

## File Sizes
- Backend Java files: ~15KB
- Frontend React files: ~12KB
- Styling: ~8KB
- Documentation: ~30KB
- Database migration: <1KB

**Total Addition: ~65KB**

---

## Git Commit Messages (Recommended)

```
feat: Integrate Google Authenticator TOTP authentication

- Add TotpService with RFC 6238 TOTP implementation
- Add TOTP setup and verification endpoints
- Create TOTP UI components (QrCodeDisplay, TotpSetupCard)
- Update authentication flow to include TOTP stage
- Add database migration for TOTP fields
- Update User entity with TOTP support
- Add comprehensive documentation

TOTP Features:
- QR code generation using qr-server.com API
- Manual secret entry support
- 30-second time windows with ±30s clock skew
- Compatible with Google Authenticator and other TOTP apps
- Production-ready error handling and validation
```

---

*Integration completed: April 6, 2026*

