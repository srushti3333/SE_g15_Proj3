// Test script to diagnose authentication issues
require('dotenv').config();
const { db } = require('./config/firebase');

console.log('🔍 Testing Firebase Connection and Auth...\n');

// Test 1: Check environment variables
console.log('1. Checking Environment Variables:');
console.log('   FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing');
console.log('   FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '✗ Missing');
console.log('   FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✓ Set' : '✗ Missing');
console.log('');

// Test 2: Test Firestore connection
async function testFirestore() {
  console.log('2. Testing Firestore Connection:');
  try {
    const testCollection = db.collection('users');
    const snapshot = await testCollection.limit(1).get();
    console.log('   ✓ Successfully connected to Firestore');
    console.log('   ✓ Users collection accessible');
    console.log(`   ℹ Found ${snapshot.size} test document(s)`);
    return true;
  } catch (error) {
    console.log('   ✗ Firestore connection failed');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 3: Test user creation
async function testUserCreation() {
  console.log('\n3. Testing User Creation:');
  const User = require('./models/User');
  
  const testEmail = `test${Date.now()}@example.com`;
  
  try {
    // Check if test user exists
    const existingUser = await User.findByEmail(testEmail);
    if (existingUser) {
      console.log('   ⚠ Test user already exists (this is unusual)');
    }
    
    // Try to create a test user
    const testUser = await User.create({
      email: testEmail,
      password: 'test123456',
      role: 'customer',
      profile: {
        name: 'Test User',
        phone: '1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      }
    });
    
    console.log('   ✓ Test user created successfully');
    console.log('   ✓ User ID:', testUser.id);
    
    // Clean up - delete test user
    await testUser.delete();
    console.log('   ✓ Test user cleaned up');
    
    return true;
  } catch (error) {
    console.log('   ✗ User creation failed');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 4: Test login
async function testLogin() {
  console.log('\n4. Testing Login:');
  const User = require('./models/User');
  
  const testEmail = `login_test${Date.now()}@example.com`;
  const testPassword = 'test123456';
  
  try {
    // Create a test user first
    const testUser = await User.create({
      email: testEmail,
      password: testPassword,
      role: 'customer',
      profile: {
        name: 'Login Test User',
        phone: '1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      }
    });
    
    console.log('   ✓ Test user created for login test');
    
    // Try to find and authenticate
    const foundUser = await User.findByEmail(testEmail);
    if (!foundUser) {
      console.log('   ✗ Could not find user after creation');
      return false;
    }
    
    console.log('   ✓ User found by email');
    
    // Check password
    if (foundUser.password === testPassword) {
      console.log('   ✓ Password verification successful');
    } else {
      console.log('   ✗ Password verification failed');
      console.log('   Expected:', testPassword);
      console.log('   Got:', foundUser.password);
    }
    
    // Clean up
    await testUser.delete();
    console.log('   ✓ Test user cleaned up');
    
    return true;
  } catch (error) {
    console.log('   ✗ Login test failed');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 5: Test getting user profile
async function testGetProfile() {
  console.log('\n5. Testing Get Profile:');
  const User = require('./models/User');
  const axios = require('axios');

  const testEmail = `profile_test${Date.now()}@example.com`;
  const testPassword = 'test123456';

  try {
    // Create test user
    const testUser = await User.create({
      email: testEmail,
      password: testPassword,
      role: 'customer',
      profile: {
        name: 'Profile Test User',
        phone: '9876543210',
        address: {
          street: '456 Test Ave',
          city: 'Testville',
          state: 'TS',
          zipCode: '54321'
        }
      }
    });

    console.log('   ✓ Test user created for profile test');

    // Call /profile endpoint
    const response = await axios.post(`http://localhost:${process.env.PORT || 3000}/auth/profile`, {
      email: testEmail,
      password: testPassword
    });

    if (response.data.user && response.data.user.email === testEmail) {
      console.log('   ✓ Profile fetched successfully');
    } else {
      console.log('   ✗ Profile fetch failed');
    }

    // Clean up
    await testUser.delete();
    console.log('   ✓ Test user cleaned up');

    return true;
  } catch (error) {
    console.log('   ✗ Get profile test failed');
    console.log('   Error:', error.message);
    return false;
  }
}

// Test 6: Test updating user profile
async function testUpdateProfile() {
  console.log('\n6. Testing Update Profile:');
  const User = require('./models/User');
  const axios = require('axios');

  const testEmail = `update_test${Date.now()}@example.com`;
  const testPassword = 'test123456';

  try {
    // Create test user
    const testUser = await User.create({
      email: testEmail,
      password: testPassword,
      role: 'customer',
      profile: {
        name: 'Update Test User',
        phone: '9876543210',
        address: {
          street: '789 Test Blvd',
          city: 'Testopolis',
          state: 'TS',
          zipCode: '67890'
        }
      }
    });

    console.log('   ✓ Test user created for update profile test');

    // Call /profile PUT endpoint
    const newProfile = {
      name: 'Updated Name',
      phone: '1112223333'
    };

    const response = await axios.put(`http://localhost:${process.env.PORT || 3000}/auth/profile`, {
      email: testEmail,
      profile: newProfile
    });

    if (response.data.user && response.data.user.profile.name === 'Updated Name') {
      console.log('   ✓ Profile updated successfully');
    } else {
      console.log('   ✗ Profile update failed');
    }

    // Clean up
    await testUser.delete();
    console.log('   ✓ Test user cleaned up');

    return true;
  } catch (error) {
    console.log('   ✗ Update profile test failed');
    console.log('   Error:', error.message);
    return false;
  }
}

// Update runTests to include profile tests
async function runTests() {
  try {
    const firestoreOk = await testFirestore();

    if (firestoreOk) {
      await testUserCreation();
      await testLogin();
      await testGetProfile();
      await testUpdateProfile();
    }

    console.log('\n✅ All diagnostic tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    process.exit(1);
  }
}

runTests();

