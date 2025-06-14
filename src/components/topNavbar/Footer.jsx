export default function Footer() {
  return (
    <footer
      className="p-3 px-6 bg-black/10 backdrop-blur-sm border border-white/20 text-white text-base rounded-lg shadow-xl animate-fadeIn"
      aria-label="Footer"
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
        `}
      </style>
      <div className="flex flex-col gap-2 sm:flex-row items-center justify-between leading-6">
        <p className="text-center font-medium text-[#441a05] text-xs">
          © 2025 All Rights Reserved by EduHub(BD) Limited
        </p>
        <div className="flex gap-4 text-center font-medium">
          <a
            href="#"
            className="hover:text-blue-400 hover:underline transition-all duration-300 text-[#441a05] text-xs"
            target="_blank"
            rel="noopener noreferrer"
            title="Privacy Policy"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="hover:text-blue-400 hover:underline transition-all duration-300 text-[#441a05] text-xs"
            target="_blank"
            rel="noopener noreferrer"
            title="Terms of Use"
          >
            Terms of Use
          </a>
        </div>
      </div>
    </footer>
  );
}