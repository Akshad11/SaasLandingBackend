# User Seeder

This script seeds the database with default HR and Admin users for development and testing purposes.

## Default Users Created

The seeder creates three users with the following credentials:

### Super Admin
- **Email:** `superadmin@aarvion.com`
- **Password:** `SuperAdmin@123`
- **Role:** `super-admin`

### Admin
- **Email:** `admin@aarvion.com`
- **Password:** `Admin@123`
- **Role:** `admin`

### HR Manager
- **Email:** `hr@aarvion.com`
- **Password:** `HR@123`
- **Role:** `hr`

## How to Run

### Using npm script (recommended):
```bash
npm run seed
```

### Direct execution:
```bash
node scripts/seedUsers.js
```

## Features

- **Duplicate Prevention:** The seeder checks if users already exist before creating them
- **Password Hashing:** Passwords are automatically hashed using bcrypt via the User model's pre-save hook
- **Environment Variables:** Uses the MONGO_URI from your `.env` file

## Verification

To verify that users were created successfully, you can:

1. Run the verification script:
```bash
node scripts/verifyUsers.js
```

2. Check your MongoDB database directly

## Security Notes

⚠️ **Important:** These are default credentials for development only. 

**For production:**
- Change all default passwords immediately
- Use strong, unique passwords
- Consider implementing additional security measures (2FA, password policies, etc.)
- Never commit real credentials to version control

## Customization

To add more users or modify existing ones, edit the `users` array in `scripts/seedUsers.js`:

```javascript
const users = [
    {
        name: 'Your Name',
        email: 'your.email@example.com',
        password: 'YourPassword123',
        role: 'admin' // or 'hr' or 'super-admin'
    }
];
```

## Troubleshooting

**Connection Issues:**
- Ensure your `.env` file has the correct `MONGO_URI`
- Check that MongoDB is running and accessible

**Duplicate Key Errors:**
- The seeder automatically skips existing users
- If you want to reset users, you can manually delete them from the database first

**Password Not Working:**
- Ensure you're using the exact password (case-sensitive)
- Check that the bcrypt hashing is working correctly in the User model
