// convertFont.js
const fs = require('fs');
const path = require('path');

// NotoSansBengali-Regular.ttf ফাইলটি যেখানে রেখেছেন, সেই অনুযায়ী পাথের পরিবর্তন করুন।
// যদি convertFont.js ফাইলটির পাশেই NotoSansBengali-Regular.ttf থাকে, তাহলে এটি ঠিক আছে।
const fontPath = path.resolve(__dirname, 'NotoSansBengali-Regular.ttf'); 

try {
  const fontData = fs.readFileSync(fontPath);
  const base64String = fontData.toString('base64');
  console.log(base64String);
} catch (error) {
  console.error('ফন্ট ফাইল পড়তে সমস্যা হয়েছে:', error.message);
  console.error('দয়া করে নিশ্চিত করুন যে NotoSansBengali-Regular.ttf ফাইলটি সঠিক পাথে আছে।');
}