import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "../../components/admin/loginAdminForm";

export default function LoginAdmin() {
  return (
    <div
      className="grid min-h-svh lg:grid-cols-1 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/assets/AdminBG_Login.svg')",
      }}
    >
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xl">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
