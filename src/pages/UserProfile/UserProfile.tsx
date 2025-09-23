import { useState } from "react";
import { Bell, User, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import "./UserProfile.css";

interface FormFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "select";
  options?: string[];
}

function FormField({ label, value, placeholder, type = "text", options }: FormFieldProps) {
  return (
    <div className="w-full">
      <label className="profile-label font-dm-sans text-xl block mb-2">{label}</label>
      <div className="relative">
        {type === "select" ? (
          <div className="profile-field p-4 flex items-center justify-between cursor-pointer">
            <span className="profile-input-text">{value}</span>
            <ChevronDown className="w-6 h-6 text-gray-400" />
          </div>
        ) : (
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            className="profile-field profile-input-text p-4 w-full border-0 outline-none"
            readOnly
          />
        )}
      </div>
    </div>
  );
}

export default function EditProfile() {
  const [profile] = useState({
    fullName: "Your First Name",
    address: "123 X St., Y City",
    gender: "Male",
    class: "User",
    dateOfBirth: "14/06/1995",
    email: "alexarawles@gmail.com",
  });

  return (
    <div className="profile-bg relative overflow-hidden">
      <header className="profile-header relative">
        <div className="absolute left-[143px] top-6 flex items-center">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/de986a7279fe24b5c6a9695fbf1915b1da6131e9?width=162"
            alt="BRIGHTNEST Logo"
            className="w-[81px] h-[81px]"
          />
          <h1 className="ml-4 text-white font-lexend text-[26px] font-semibold leading-none tracking-[-2.34px] capitalize">
            BRIGHTNEST
          </h1>
        </div>

        {/* Navigation */}
        <nav className="absolute top-[52px] left-[594px] flex items-center space-x-8">
          <Link
            to="/"
            className="text-black font-lexend text-xl leading-none tracking-[-2.8px] capitalize hover:text-gray-700 transition-colors"
          >
            Home
          </Link>
          <span className="text-black font-lexend text-xl leading-none tracking-[-2.8px] capitalize hover:text-gray-700 transition-colors">
            Blogs
          </span>
          <span className="text-black font-lexend text-xl leading-none tracking-[-2.8px] capitalize hover:text-gray-700 transition-colors">
            Gamification
          </span>
          <span className="text-black font-lexend text-xl leading-none tracking-[-2.8px] capitalize hover:text-gray-700 transition-colors">
            First aid
          </span>
          <span className="text-black font-lexend text-xl leading-none tracking-[-2.8px] capitalize hover:text-gray-700 transition-colors">
            About
          </span>
        </nav>

        <div className="absolute top-[49px] right-[143px] flex items-center space-x-4">
          <div className="w-6 h-6 text-white">
            <Bell className="w-full h-full" />
          </div>
          <div className="w-[37px] h-[37px] bg-white rounded-full flex items-center justify-center bg-gray-100">
            <User className="w-6 h-6 text-brightnest-accent" />
          </div>
        </div>
      </header>

      <div className="relative flex">
        <aside className="w-[104px] min-h-[832px] flex flex-col items-center py-8">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/7fa1177f86ac2a1a80b2c178a992b6f4fb7b2bfb?width=208"
            alt="Sidebar decoration"
            className="w-[104px] h-full object-cover"
          />
        </aside>

        <main className="flex-1 px-8 py-12">
          <div className="mb-8">
            <h2 className="text-brightnest-primary font-dm-sans text-5xl font-bold leading-[46px] capitalize mb-8">
              Edit Profile
            </h2>

            {/* User Profile Section */}
            <div className="flex items-center mb-12">
              <div className="relative">
                <div className="w-[100px] h-[100px] rounded-full profile-avatar flex items-center justify-center"></div>
                <div className="absolute bottom-1 right-1 profile-edit-btn">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.41306 0.58591C10.1532 -0.154187 11.329 -0.193139 12.115 0.469052L12.2422 0.58591L13.4141 1.75763C14.1542 2.49773 14.1931 3.67359 13.531 4.45956L13.4141 4.5868L6.28606 11.7151C6.14757 11.8536 5.98973 11.9709 5.81777 12.0632L5.64129 12.1471L1.38799 13.9201C0.597736 14.2495 -0.194906 13.5035 0.0429051 12.715L0.0798527 12.612L1.85311 8.35883C1.92858 8.17803 2.02993 8.00961 2.15379 7.8588L2.28502 7.71405L9.41306 0.58591Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-brightnest-accent font-dm-sans text-2xl font-medium tracking-[-0.12px]">
                  Name
                </h3>
                <p className="text-black font-dm-sans text-base tracking-[-0.08px] mt-2">Class</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 gap-x-16">
            <div className="space-y-8">
              <FormField label="Full Name" value={profile.fullName} placeholder="Your First Name" />
              <FormField label="Gender" value={profile.gender} type="select" />
              <FormField label="Date of birth" value={profile.dateOfBirth} type="select" />
            </div>

            <div className="space-y-8">
              <FormField label="Address" value={profile.address} placeholder="123 X St., Y City" />
              <FormField label="Class" value={profile.class} type="select" />
            </div>
          </div>

          {/* Email Section */}
          <div className="mt-12">
            <h3 className="profile-email-label font-dm-sans text-xl font-medium mb-4">
              My email Address
            </h3>

            <div className="flex items-center mb-6">
              <div className="profile-email-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 3.5H7C4 3.5 2 5 2 8.5V15.5C2 19 4 20.5 7 20.5H17C20 20.5 22 19 22 15.5V8.5C22 5 20 3.5 17 3.5ZM17.47 9.59L14.34 12.09C13.68 12.62 12.84 12.88 12 12.88C11.16 12.88 10.31 12.62 9.66 12.09L6.53 9.59C6.21 9.33 6.16 8.85 6.41 8.53C6.67 8.21 7.14 8.15 7.46 8.41L10.59 10.91C11.35 11.52 12.64 11.52 13.4 10.91L16.53 8.41C16.85 8.15 17.33 8.2 17.58 8.53C17.84 8.85 17.79 9.33 17.47 9.59Z"
                    fill="#00B0B9"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-black font-poppins text-xl">{profile.email}</p>
                <p className="text-black/50 font-poppins text-base">1 month ago</p>
              </div>
              <div className="ml-auto">
                <button className="profile-save-btn font-dm-sans text-xl">Save</button>
              </div>
            </div>

            <button className="profile-add-email-btn font-poppins text-base">
              +Add Email Address
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
