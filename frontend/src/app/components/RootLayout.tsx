import { Outlet } from "react-router";


export function RootLayout() {

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto min-h-screen bg-gradient-to-b from-black via-[#0a0a14] to-black relative overflow-x-clip">
        <Outlet />
      </div>
    </div>
  );
}
