import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import Logo from "@/components/ui/logo";
import { useAuth } from "../../hooks/use-auth"; // Changed to relative import
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRound, ShoppingCart, ChevronDown } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link href="/" className="mr-8">
                <Logo />
              </Link>
              <nav>
                <ul className="hidden md:flex space-x-6">
                  <li>
                    <Link href="/chi-siamo" className="hover:text-gray-300">Chi siamo</Link>
                  </li>
                  <li className="relative group">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center hover:text-gray-300">
                          Lavora con noi
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48">
                        <DropdownMenuItem>
                          <Link href="/lavora-con-noi/opportunita">Opportunità di lavoro</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/lavora-con-noi/partner">Partner commerciali</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/lavora-con-noi/guide">Guide turistiche</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                  <li className="relative group">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center hover:text-gray-300">
                          Eventi
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48">
                        <DropdownMenuItem>
                          <Link href="/eventi/fiere">Fiere</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/eventi/workshop">Workshop</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/eventi/webinar">Webinar</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                  <li>
                    <Link href="/contatti" className="hover:text-gray-300">Contatti e supporto</Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hover:text-gray-300">
                      <UserRound className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/profilo">Il mio profilo</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/preferences">Le mie preferenze</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/results">I miei pacchetti</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/bookings">Le mie prenotazioni</s