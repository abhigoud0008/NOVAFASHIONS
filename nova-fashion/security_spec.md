# Security Specification (Firestore Security Rules)

## 1. Data Invariants
- **Users**: Users are identified by their unique billing/login phone number (`phoneNumber`). Since this app manages authentication using a phone number + password combination stored in Firestore, a user's collection document can only be written by themselves on creation. Read/writes are strictly locked down to prevent spoofing other people's credential states.
- **Products/Dresses**: The apparel catalog can change anytime. Regular clients can read all details of the active catalog, but any adding, updating of price, or deletion of a dress must be strictly restircted to verified administrators.
- **Orders/Bookings**: Customers can create their own orders securely. To protect the query boundaries, users can only list and retrieve orders where `customerPhone` strictly matches their own login phone number. Admin has global list/edit override privileges so they can handle logistics operations.

## 2. The "Dirty Dozen" Payloads
These payloads describe disallowed, high-risk, or malicious transactions that must return `PERMISSION_DENIED` under all circumstances:
1. **Unsigned-In Write**: Attempt to write a new product without being an Admin.
2. **Catalog Poisoning**: Attempt to delete a product by an authenticated regular user.
3. **Privilege Escalation**: User registers with key role parameters like `role: 'admin'` to gain control.
4. **Credential Hijack**: Session attempts to update `users/0999888777` (someone else's account) to reset their password.
5. **PII Snooping**: Regular user tries to read private credentials of another phone number.
6. **Order Theft**: User logs in as `0999888111` and queries or reads orders belonging to `0999888222`.
7. **Phantom Bookings**: Guest attempts to create an order mapped to a registered phone number without proper verification.
8. **Malicious ID Injection**: Malformed characters (like 1.5KB string containing control characters) inserted as `productId` or `orderId` to trigger crashes.
9. **Status Fast-Tracking**: Client attempts to forcefully modify an order status from `Processing` to `Delivered` bypassing the dispatch line.
10. **Time Spoofing**: Client overrides `createdAt` with a backdated historical timestamp instead of the official server timestamp.
11. **Price Manipulation**: Customer modifies price of a product during checkout.
12. **System Role Bypass**: Forging custom administrative credentials locally to gain unauthorized write access on the database.

## 3. The Security Rules Draft
These tests will be backed up by the following `firestore.rules` secure configuration:
- Default catch-all `allow read, write: if false;`
- Strict `isValidId` and type-size constraints on all fields.
- Admin validation checked against safe roles logic or admin email lookup.
