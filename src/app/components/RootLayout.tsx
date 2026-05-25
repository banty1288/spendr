import { Outlet } from "react-router";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[430px] mx-auto min-h-screen bg-gradient-to-b from-black via-[#0a0a14] to-black relative overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
