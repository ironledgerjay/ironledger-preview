# CRM Integration Endpoints Documentation

## Overview
The IronLedger MedMap platform provides comprehensive CRM endpoints for administrative oversight and doctor approval workflows. All endpoints are accessible from the admin CRM at `https://admin-crm-ironledgermedma.replit.app/`.

## Base URL
All endpoints are accessible at: `https://2b766c92-3e5e-4b98-9f27-08cd4ac2e584-00-n4xo83p18h5y.riker.replit.dev`

## CRM Endpoints

### 1. Platform Statistics
```
GET /api/crm/stats
```
Returns live platform statistics including total doctors, patients, bookings, and real-time metrics.

**Response Example:**
```json
{
  "totalDoctors": 6,
  "totalPatients": 0,
  "totalBookings": 0,
  "averageRating": 0,
  "totalUsers": 6,
  "totalVerifiedDoctors": 6,
  "timestamp": "2025-08-28T21:28:35.123Z"
}
```

### 2. Activity Monitoring
```
GET /api/crm/activity?limit=50
```
Retrieves recent activity logs for monitoring user actions and system events.

**Response Example:**
```json
[
  {
    "userId": "user123",
    "userType": "doctor",
    "action": "doctor_registration",
    "page": "signup",
    "details": {...},
    "source": "main_site",
    "timestamp": "2025-08-28T21:28:34.659Z",
    "id": "log-id"
  }
]
```

### 3. System Notifications
```
GET /api/crm/notifications
POST /api/crm/notifications
```
Manages cross-system notifications for important events like doctor registrations.

**GET Response Example:**
```json
[
  {
    "type": "doctor_registration",
    "title": "New Doctor Registration",
    "message": "Dr. Testing CRMDoctor has registered and requires verification",
    "targetSystem": "admin_crm",
    "metadata": "{\"doctorId\":\"...\",\"priority\":\"high\"}",
    "isRead": false,
    "createdAt": "2025-08-28T21:28:34.659Z"
  }
]
```

### 4. Doctor Management

#### Get All Doctors
```
GET /api/crm/doctors
```
Returns all doctors in the system (verified and unverified).

#### Get Pending Doctors (Key for Approvals)
```
GET /api/crm/doctors/pending
```
**This is the primary endpoint for admin CRM to see doctors awaiting approval.**

**Response Example:**
```json
[
  {
    "userId": "ef2c1b0a-f64a-438b-930b-86e765de66c4",
    "firstName": "Testing",
    "lastName": "CRMDoctor",
    "email": "crmtest@test.com",
    "phone": "+27123456789",
    "specialty": "Emergency Medicine",
    "province": "Gauteng",
    "city": "Johannesburg",
    "hpcsaNumber": "MP999888",
    "practiceAddress": "999 Test Medical Centre",
    "bio": "Testing CRM integration",
    "isVerified": false,
    "id": "74806198-bfc3-4a2e-a12d-908eb007442d",
    "rating": "0.00",
    "reviewCount": 0,
    "consultationFee": "650.00"
  }
]
```

#### Approve/Reject Doctor
```
PATCH /api/crm/doctors/{doctorId}/verify
```

**Request Body:**
```json
{
  "isVerified": true,
  "notes": "HPCSA verification completed successfully"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Doctor approved successfully",
  "doctorId": "74806198-bfc3-4a2e-a12d-908eb007442d",
  "doctor": {...}
}
```

## Integration Notes

### For Admin CRM Development:
1. **Primary Workflow**: Use `/api/crm/doctors/pending` to fetch doctors awaiting approval
2. **Approval Action**: Use `/api/crm/doctors/{id}/verify` to approve/reject doctors
3. **Real-time Updates**: Poll `/api/crm/notifications` for new registrations
4. **Activity Monitoring**: Use `/api/crm/activity` to track all platform actions

### Data Flow:
1. Doctor registers via main site → Creates user and doctor profile with `isVerified: false`
2. System creates high-priority notification in `/api/crm/notifications`
3. Activity logged in `/api/crm/activity` 
4. Admin CRM fetches pending doctors via `/api/crm/doctors/pending`
5. Admin approves/rejects via `/api/crm/doctors/{id}/verify`
6. System logs approval action and notifies doctor

### Security:
- All endpoints are accessible without authentication for development
- In production, implement proper authentication and authorization
- All actions are logged for audit trails

## Testing Commands

Test doctor registration:
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"userType":"doctor","firstName":"Test","lastName":"Doctor","email":"test@example.com","specialty":"General Practice","hpcsaNumber":"MP123456"}'
```

Check pending approvals:
```bash
curl http://localhost:5000/api/crm/doctors/pending
```

Approve doctor:
```bash
curl -X PATCH http://localhost:5000/api/crm/doctors/{doctorId}/verify \
  -H "Content-Type: application/json" \
  -d '{"isVerified":true,"notes":"Approved after verification"}'
```