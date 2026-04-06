# Google Authenticator TOTP Integration Guide

## Overview
This document outlines the integration of Google Authenticator TOTP (Time-based One-Time Password) authentication into the Sritha Oils e-commerce application, replacing the development OTP system.

## Architecture Changes

### Backend (Java/Spring Boot)

#### 1. **New Dependencies Added** (`pom.xml`)
- `commons-codec:commons-codec:1.16.0` - For Base32 encoding
- `de.taimos:totp:1.0` - TOTP utilities

#### 2. **Database Schema** (`V2__add_totp_fields.sql`)
Added three new fields to the `users` table:
- `totp_secret` (VARCHAR 255) - Stores the user's TOTP secret key
- `totp_enabled` (BOOLEAN) - Indicates if TOTP is enabled for the user
- `totp_setup_pending` (BOOLEAN) - Temporary flag during TOTP setup

#### 3. **Entity Updates** (`User.java`)
Added four new fields with getters/setters:
- `totpSecret: String` - Base32-encoded secret
- `totpEnabled: boolean` - TOTP active flag
- `totpSetupPending: boolean` - Setup in progress flag

#### 4. **Core TOTP Service** (`TotpService.java`)
New service class with the following methods:

```java
// Generate a new TOTP secret (Base32 encoded)
String generateSecret()

// Generate QR code provisioning URI for Google Authenticator
String generateProvisioningUri(String secret, String email, String issuer)

// Verify a TOTP code (allows ±30 second time drift)
boolean verifyCode(String secret, String code)
```

#### 5. **New DTOs** (`dto/auth/`)
- `TotpSetupRequest(String phoneNumber)` - Initiate TOTP setup
- `TotpSetupResponse(String secret, String qrCodeUri, String message)` - TOTP setup details
- `TotpSetupVerifyRequest(String phoneNumber, String code)` - Verify TOTP during setup
- `TotpVerifyRequest(String phoneNumber, String code)` - TOTP code verification

#### 6. **Updated AuthService** (`AuthService.java`)
Three new methods:

```java
// Initiate TOTP setup for a user
TotpSetupResponse initiateTotpSetup(TotpSetupRequest request)

// Verify and complete TOTP setup
TotpSetupResponse verifyAndCompleteTotpSetup(TotpSetupVerifyRequest request)

// Verify TOTP code for login
AuthResponse verifyTotp(TotpVerifyRequest request)
```

#### 7. **Updated AuthController** (`AuthController.java`)
Three new endpoints:
- `POST /api/auth/totp/setup/initiate` - Generate TOTP secret and QR code
- `POST /api/auth/totp/setup/verify` - Verify and complete TOTP setup
- `POST /api/auth/verify-totp` - Verify TOTP code during login

### Frontend (React)

#### 1. **Updated Services** (`services/authService.js`)
Added three new API call functions:

```javascript
// Initiate TOTP setup
initiateTotpSetup(phoneNumber)

// Verify TOTP setup with code
verifyTotpSetup(phoneNumber, code)

// Verify TOTP code for login
verifyTotpCode(phoneNumber, code)
```

#### 2. **Updated Context** (`StorefrontContext.jsx`)
Added new state variables:
- `totpSecret` - Current TOTP secret
- `totpQrCodeUri` - QR code URI for display
- `totpSetupPending` - Setup status flag

New methods:
- `setupTotp()` - Initiate TOTP setup
- `completeTotpSetup(code)` - Verify and complete setup
- `verifyTotp(code)` - Verify TOTP code during login

#### 3. **New Components**

**QrCodeDisplay.jsx**
- Displays QR code using QR Server API
- Shows manual entry option (Base32 secret)
- Displays account info and issuer

**TotpSetupCard.jsx**
- Complete TOTP setup UI component
- Shows step-by-step instructions
- Integrates QR code display
- TOTP code input field
- Cancel and verify buttons

#### 4. **Updated LoginPage** (`pages/LoginPage.jsx`)
- Added `totp-setup` as a new authentication stage
- Updated `StageIndicator` to include TOTP stage
- Added TOTP setup handler functions
- Renders `TotpSetupCard` component during TOTP stage
- Flow: Phone → OTP → TOTP Setup → Registration

#### 5. **New Styles** (`styles/totp.css`)
Comprehensive styling for:
- TOTP setup card layout
- QR code display
- Secret key display
- Form inputs and buttons
- Responsive mobile design

## Authentication Flow

### New User Registration
1. **Phone Stage**: User enters phone number
2. **OTP Stage**: User receives and enters OTP code
3. **TOTP Setup Stage** *(NEW)*: 
   - User scans QR code with Google Authenticator app
   - Or manually enters the secret key
   - User enters 6-digit code from app to verify setup
4. **Registration Stage**: User creates account with name and email

### Existing User Login
1. **Phone Stage**: User enters phone number
2. **OTP Stage**: User receives and enters OTP code
3. **TOTP Verification** *(NEW)*: User enters 6-digit TOTP code

## Key Features

### Security
- **HMAC-SHA1 algorithm** with Base32 encoding
- **Time-based verification** with 30-second window
- **Clock skew tolerance** of ±30 seconds (±1 time step)
- **Secure random generation** using SecureRandom

### User Experience
- **QR code scanning** via Google Authenticator app
- **Manual entry option** for users without camera access
- **Visual QR code generation** using qr-server.com API
- **Step-by-step instructions** during setup
- **Real-time code verification** with instant feedback

### Compatibility
- Works with Google Authenticator app
- Works with Authy, Microsoft Authenticator, and other TOTP apps
- Backward compatible with existing OTP system (can coexist)
- Standard 6-digit TOTP codes (RFC 6238 compliant)

## Database Migration

The migration file `V2__add_totp_fields.sql` will be automatically applied on the next database initialization. Existing user records will have default values:
- `totp_secret = NULL`
- `totp_enabled = false`
- `totp_setup_pending = false`

## API Endpoints Reference

### TOTP Setup Initiation
**POST** `/api/auth/totp/setup/initiate`
```json
Request: {
  "phoneNumber": "9876543210"
}

Response: {
  "secret": "XYZABC123DEF456GHI789JKL",
  "qrCodeUri": "otpauth://totp/9876543210?secret=...",
  "message": "Scan the QR code with Google Authenticator or enter the secret manually"
}
```

### TOTP Setup Verification
**POST** `/api/auth/totp/setup/verify`
```json
Request: {
  "phoneNumber": "9876543210",
  "code": "123456"
}

Response: {
  "secret": "XYZABC123DEF456GHI789JKL",
  "qrCodeUri": "otpauth://totp/9876543210?secret=...",
  "message": "TOTP setup completed successfully"
}
```

### TOTP Verification (Login)
**POST** `/api/auth/verify-totp`
```json
Request: {
  "phoneNumber": "9876543210",
  "code": "123456"
}

Response: {
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresAt": "2026-04-07T10:30:00Z",
  "userId": 1,
  "phoneNumber": "9876543210",
  "registered": true,
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Configuration

### Backend Properties
Currently using defaults. Can be customized in `application.properties`:

```properties
# TOTP time step (seconds) - Default: 30
app.auth.totp-time-step=30

# TOTP digits - Default: 6
app.auth.totp-digits=6

# TOTP algorithm - Default: HmacSHA1
app.auth.totp-algorithm=HmacSHA1
```

### Frontend Environment Variables
```env
# Base API URL for auth endpoints
VITE_API_BASE_URL=http://localhost:8080

# Auth refresh path (optional)
VITE_AUTH_REFRESH_PATH=/api/auth/refresh
```

## Testing

### Manual Testing Checklist
- [ ] Backend compiles without errors
- [ ] Database migration runs successfully
- [ ] User can initiate TOTP setup
- [ ] QR code displays correctly
- [ ] Manual secret entry works
- [ ] Code verification accepts valid codes
- [ ] Code verification rejects invalid codes
- [ ] Time drift tolerance works (±30 seconds)
- [ ] Frontend components render correctly
- [ ] Full auth flow works end-to-end

### Test Users
Use Google Authenticator app to scan QR codes or enter secrets manually during testing.

## Future Enhancements

1. **Backup Codes**: Generate recovery codes for account recovery
2. **TOTP Disable**: Allow users to disable TOTP if needed
3. **Hardware Keys**: Add support for hardware security keys (U2F)
4. **SMS Backup**: Fallback to SMS if TOTP fails
5. **Admin Dashboard**: View TOTP status for user accounts
6. **Rate Limiting**: Prevent brute force TOTP attacks
7. **QR Code Scanning**: Allow scanning QR codes from camera

## Troubleshooting

### QR Code Not Displaying
- Check browser network tab for qr-server.com requests
- Ensure `QrCodeDisplay.jsx` is properly imported
- Verify `totpQrCodeUri` is not empty

### TOTP Code Not Verifying
- Ensure device time is synchronized
- Check that 30 seconds haven't passed since code generation
- Verify Base32 secret encoding

### Database Migration Issues
- Ensure PostgreSQL is running
- Check flyway migration status: `mvn flyway:info`
- Review migration logs for errors

## Files Modified/Created

### Backend
- `pom.xml` - Added TOTP dependencies
- `src/main/resources/db/migration/V2__add_totp_fields.sql` - Database migration
- `src/main/java/com/srithaoils/backend/entity/User.java` - Added TOTP fields
- `src/main/java/com/srithaoils/backend/service/TotpService.java` - NEW
- `src/main/java/com/srithaoils/backend/dto/auth/TotpSetupRequest.java` - NEW
- `src/main/java/com/srithaoils/backend/dto/auth/TotpSetupResponse.java` - NEW
- `src/main/java/com/srithaoils/backend/dto/auth/TotpSetupVerifyRequest.java` - NEW
- `src/main/java/com/srithaoils/backend/dto/auth/TotpVerifyRequest.java` - NEW
- `src/main/java/com/srithaoils/backend/service/AuthService.java` - Updated
- `src/main/java/com/srithaoils/backend/controller/AuthController.java` - Updated

### Frontend
- `frontend/src/services/authService.js` - Updated
- `frontend/src/context/StorefrontContext.jsx` - Updated
- `frontend/src/pages/LoginPage.jsx` - Updated
- `frontend/src/components/QrCodeDisplay.jsx` - NEW
- `frontend/src/components/TotpSetupCard.jsx` - NEW
- `frontend/src/styles/totp.css` - NEW

## Deployment Notes

1. **Database**: Run Flyway migrations before deploying
2. **Backend**: Rebuild WAR/JAR with Maven
3. **Frontend**: Build with Vite and deploy
4. **Secrets**: Store TOTP secrets securely in database
5. **Time Sync**: Ensure server time is synchronized (NTP)

## Support

For issues or questions about TOTP integration:
1. Check logs for TOTP validation errors
2. Verify secret key encoding
3. Test with multiple authenticator apps
4. Review time drift settings

