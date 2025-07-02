// src/config/apiConfig.js

const getSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split(".");
  return parts.length == 3 ? parts[0] : null;
  // return parts[0] || null;
};

const subdomain = getSubdomain();

let BASE_URL = "";

// ✅ BASE_URL access করার আগে এটা async validate করে ফেলবে
const validateTenant = async () => {
  if (!subdomain) {
    showNoSubdomainScreen();
    return;
  }

  try {
    const res = await fetch(`https://${subdomain}.easydr.xyz/api/tenant-info/`);
    const data = await res.json();

    if (data?.matched) {
      BASE_URL = `https://${subdomain}.easydr.xyz/api`;
    } else {
      showInvalidSubdomainScreen();
    }
  } catch {
    showInvalidSubdomainScreen();
  }
};

const showNoSubdomainScreen = () => {
  document.body.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 100vh;
      background: linear-gradient(135deg, #fdf6e3, #ffe0b2);
      font-family: 'Segoe UI', sans-serif;
      padding: 40px;
      text-align: center;
      color: #a64b00;
    ">
      <div style="
        background: white;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        max-width: 600px;
        width: 90%;
        animation: fadeIn 1s ease-in-out;
      ">
        <h1 style="font-size: 32px; margin-bottom: 16px;">🚧 Coming Soon</h1>
        <p style="font-size: 18px; color: #5d4037; line-height: 1.6;">
          আমাদের সাইটটি প্রস্তুত হচ্ছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।
        </p>
      </div>
    </div>

    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `;
};


const showInvalidSubdomainScreen = () => {
  document.body.innerHTML = `
    <div style="
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;
      background:#fff;
      color:red;
      font-size:24px;
      font-weight:bold;
    ">
      ❌ Invalid URL / Tenant not found
    </div>
  `;
};

await validateTenant();

export default BASE_URL;
