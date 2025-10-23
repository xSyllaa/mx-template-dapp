# 🧪 Test Guide - Predictions API

## 📋 Purpose
This guide helps test the predictions API to diagnose why historical predictions are not showing in the admin panel.

## 🚀 How to Run the Test

### Method 1: Using Node.js (Recommended)
```bash
# Navigate to project root
cd "C:\Users\felix\Documents\MioSguardo Félix\Sylla Lectoure\Syll-AI\Web developpement\Website Projects\Web3\GalacticXsocios\GalacticDapp"

# Run the test script
node test-predictions-api.js
```

### Method 2: Using Browser Console
1. Open the admin predictions page in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Copy and paste the test code from `test-predictions-api.js`
5. Execute the code

### Method 3: Using Postman/Insomnia
1. Create a new GET request
2. URL: `http://localhost:3001/api/predictions` (or your API URL)
3. Add Authorization header if needed: `Bearer YOUR_JWT_TOKEN`
4. Send the request

## 🔍 What the Test Checks

### 1. API Connectivity
- ✅ API endpoint is reachable
- ✅ Response format is correct
- ✅ Authentication works (if required)

### 2. Data Analysis
- ✅ Total number of predictions
- ✅ Status breakdown (open, closed, resulted, cancelled)
- ✅ Individual prediction details
- ✅ Historical predictions count

### 3. Expected Results

#### If API is working correctly:
```
🔍 Total predictions: 5
🔍 Status breakdown: { open: 3, closed: 1, resulted: 1, cancelled: 0 }
🔍 Historical predictions count: 1
```

#### If no historical predictions exist:
```
🔍 Total predictions: 5
🔍 Status breakdown: { open: 5, closed: 0, resulted: 0, cancelled: 0 }
🔍 Historical predictions count: 0
⚠️  No historical predictions found!
💡 This explains why the admin page shows (0) for historical predictions
```

## 🎯 Common Issues & Solutions

### Issue 1: API Not Reachable
**Error**: `ECONNREFUSED` or network error
**Solutions**:
- Check if the backend server is running
- Verify the API URL in environment variables
- Check firewall/network settings

### Issue 2: Authentication Required
**Error**: `401 Unauthorized`
**Solutions**:
- Add JWT token to request headers
- Check if user is logged in
- Verify token is valid

### Issue 3: No Historical Predictions
**Result**: `Historical predictions count: 0`
**Solutions**:
- Create some test predictions with 'resulted' or 'cancelled' status
- Check if predictions have been validated
- Verify database contains historical data

## 🔧 Creating Test Data

If no historical predictions exist, you can create some test data:

### Method 1: Via Admin Panel
1. Create a new prediction
2. Set status to 'closed'
3. Validate the result to set status to 'resulted'

### Method 2: Via Database (if you have access)
```sql
-- Update existing predictions to 'resulted' status
UPDATE predictions 
SET status = 'resulted', 
    winning_option_id = (SELECT id FROM prediction_options WHERE prediction_id = predictions.id LIMIT 1)
WHERE status = 'open' 
LIMIT 2;

-- Update some predictions to 'cancelled' status
UPDATE predictions 
SET status = 'cancelled'
WHERE status = 'closed' 
LIMIT 1;
```

## 📊 Understanding the Results

### Status Values Explained:
- **open**: Predictions accepting bets
- **closed**: Predictions closed for betting (but not yet validated)
- **resulted**: Predictions with validated results
- **cancelled**: Cancelled predictions (refunded)

### Historical Predictions:
Historical predictions are those with status `resulted` or `cancelled`. These should appear in the "Prédictions Résultées & Annulées" section of the admin panel.

## 🚀 Next Steps

1. **Run the test** to identify the issue
2. **Analyze the results** to understand what's happening
3. **Create test data** if no historical predictions exist
4. **Fix the issue** based on the test results
5. **Remove debug logs** once the issue is resolved

---

**Note**: This test script is temporary and should be removed after resolving the issue.
