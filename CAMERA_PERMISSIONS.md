# Camera Permissions Troubleshooting Guide

## 🚨 Common Camera Permission Issues

### 1. **Browser Not Requesting Permission**
**Problem**: No permission prompt appears when trying to use the camera.

**Solutions**:
- **Refresh the page** after allowing permissions
- **Check browser settings** for site permissions
- **Clear browser cache** and cookies
- **Try a different browser** (Chrome, Firefox, Safari, Edge)

### 2. **Permission Denied**
**Problem**: Camera access is blocked or denied.

**Solutions**:
- **Click the camera icon** in the browser address bar
- **Select "Allow"** for camera access
- **Check site settings** in browser preferences
- **Reset site permissions** and try again

### 3. **Camera Already in Use**
**Problem**: Another application is using the camera.

**Solutions**:
- **Close other apps** that might be using the camera
- **Restart your device** to release camera resources
- **Check for video conferencing apps** running in background

### 4. **No Camera Found**
**Problem**: Device doesn't have a camera or it's not detected.

**Solutions**:
- **Check if your device has a camera**
- **Update camera drivers** (Windows)
- **Check device manager** for camera status
- **Try on a different device**

## 🔧 Browser-Specific Instructions

### **Google Chrome**
1. Click the **camera icon** in the address bar
2. Select **"Allow"** for camera access
3. If blocked, go to **Settings > Privacy and security > Site Settings > Camera**
4. Find your site and set to **"Allow"**

### **Mozilla Firefox**
1. Click the **camera icon** in the address bar
2. Select **"Allow"** for camera access
3. If blocked, go to **Settings > Privacy & Security > Permissions > Camera**
4. Click **"Settings"** and add your site to allowed list

### **Microsoft Edge**
1. Click the **camera icon** in the address bar
2. Select **"Allow"** for camera access
3. If blocked, go to **Settings > Cookies and site permissions > Camera**
4. Add your site to the allowed list

### **Safari (Mac)**
1. Go to **Safari > Preferences > Websites > Camera**
2. Find your site and set to **"Allow"**
3. **Refresh the page** after changing permissions

## 📱 Mobile Device Instructions

### **Android (Chrome)**
1. **Allow camera permissions** when prompted
2. If denied, go to **Settings > Apps > Chrome > Permissions > Camera**
3. Set to **"Allow"** and refresh the page

### **iOS (Safari)**
1. **Allow camera permissions** when prompted
2. If denied, go to **Settings > Safari > Camera**
3. Set to **"Allow"** and refresh the page

## 🚀 Testing Camera Access

### **Step-by-Step Test**
1. **Open the OCR scanner** in your dashboard
2. **Click "Enable Camera"** button
3. **Look for permission prompt** in browser
4. **Allow camera access** when prompted
5. **Camera should activate** and show live feed

### **What to Expect**
- ✅ **Permission prompt** appears
- ✅ **Camera activates** with live feed
- ✅ **Scanning frame** appears on screen
- ✅ **Capture button** becomes available

### **Common Error Messages**
- **"Camera access denied"** → Check browser permissions
- **"Camera already in use"** → Close other camera apps
- **"No camera found"** → Check device hardware
- **"Permission blocked"** → Reset site permissions

## 🔒 Security Considerations

### **HTTPS Required**
- Camera access **only works on HTTPS** connections
- **Local development** may require special setup
- **Production sites** must use HTTPS

### **Permission Persistence**
- Permissions are **remembered** by the browser
- **Clearing browser data** resets permissions
- **Private/Incognito mode** doesn't save permissions

## 📞 Getting Help

### **Still Having Issues?**
1. **Check browser console** for error messages
2. **Try different browser** to isolate the problem
3. **Test on different device** to verify hardware
4. **Contact support** with specific error details

### **Debug Information to Collect**
- **Browser name and version**
- **Operating system**
- **Error message text**
- **Console error logs**
- **Steps to reproduce**

---

**Note**: Camera permissions are essential for the OCR functionality. If you continue to have issues, please provide the specific error messages and browser information for better assistance.
