#!/usr/bin/env python3
"""
Test script for Status Page Registration
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_registration():
    """Test user registration"""
    print("🔐 Testing User Registration...")
    
    # Test data
    user_data = {
        "email": "test@example.com",
        "password": "TestPass123!",
        "name": "Test User",
        "organization_name": "Test Organization"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            data = response.json()
            print(f"👤 User: {data['user']['name']}")
            print(f"📧 Email: {data['user']['email']}")
            print(f"🏢 Organization: {data['organization']['name']}")
            print(f"🔗 Slug: {data['organization']['slug']}")
            print(f"🔑 Token received: {'access_token' in data}")
            return data['access_token'], data['organization']['slug']
            
        elif response.status_code == 400:
            error_data = response.json()
            if "User already exists" in error_data.get('error', ''):
                print("ℹ️ User already exists, trying login instead...")
                return test_login(user_data['email'], user_data['password'])
            else:
                print(f"❌ Registration failed: {error_data}")
                return None, None
        else:
            print(f"❌ Registration failed with status {response.status_code}: {response.text}")
            return None, None
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server. Is it running on http://localhost:5000?")
        return None, None
    except Exception as e:
        print(f"❌ Error during registration: {e}")
        return None, None

def test_login(email, password):
    """Test user login"""
    print("🔐 Testing User Login...")
    
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        
        if response.status_code == 200:
            print("✅ Login successful!")
            data = response.json()
            print(f"👤 Logged in as: {data['user']['name']}")
            return data['access_token'], data['organization']['slug']
        else:
            print(f"❌ Login failed: {response.json()}")
            return None, None
            
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return None, None

def test_protected_endpoint(token):
    """Test accessing protected endpoint"""
    print("🔒 Testing Protected Endpoint...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        if response.status_code == 200:
            print("✅ Protected endpoint working!")
            data = response.json()
            print(f"📧 User email: {data['user']['email']}")
            print(f"🎭 User role: {data['user']['role']}")
            return True
        else:
            print(f"❌ Protected endpoint failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error accessing protected endpoint: {e}")
        return False

def test_public_endpoint(org_slug):
    """Test public status endpoint"""
    print("🌍 Testing Public Status Endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/public/{org_slug}/status")
        
        if response.status_code == 200:
            print("✅ Public endpoint working!")
            data = response.json()
            print(f"🏢 Organization: {data['organization']['name']}")
            print(f"📊 Services count: {len(data['services'])}")
            return True
        else:
            print(f"❌ Public endpoint failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error accessing public endpoint: {e}")
        return False

def main():
    print("🚀 Status Page Registration Test Suite")
    print("=" * 50)
    
    # Test registration
    token, org_slug = test_registration()
    
    if token and org_slug:
        print(f"\n📋 Test Results Summary:")
        print(f"✅ Registration/Login: Success")
        
        # Test protected endpoint
        auth_working = test_protected_endpoint(token)
        print(f"{'✅' if auth_working else '❌'} Authentication: {'Success' if auth_working else 'Failed'}")
        
        # Test public endpoint
        public_working = test_public_endpoint(org_slug)
        print(f"{'✅' if public_working else '❌'} Public API: {'Success' if public_working else 'Failed'}")
        
        print(f"\n🔗 URLs to test:")
        print(f"📱 Frontend: http://localhost:5174")
        print(f"🌍 Public Status: http://localhost:5174/public/{org_slug}")
        print(f"🏠 Dashboard: http://localhost:5174/dashboard")
        
    else:
        print("\n❌ Registration test failed!")
        print("🔧 Troubleshooting:")
        print("1. Check if backend is running: python backend/app.py")
        print("2. Check if database is accessible")
        print("3. Check network connectivity")

if __name__ == "__main__":
    main()
