// convertFont.js
const fs = require('fs');
const path = require('path');

const fontPath = path.resolve(__dirname, 'NotoSerifBengali-VariableFont_wdth,wght.ttf'); 

try {
  const fontData = fs.readFileSync(fontPath);
  const base64String = fontData.toString('base64');
  console.log(base64String);
} catch (error) {
  console.error('ফন্ট ফাইল পড়তে সমস্যা হয়েছে:', error.message);
  console.error('দয়া করে নিশ্চিত করুন যে NotoSerifBengali-VariableFont_wdth,wght.ttf ফাইলটি সঠিক পাথে আছে।');
}