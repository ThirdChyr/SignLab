import { useEffect, useState, useCallback } from "react";
import axios from "@/app/axios";
import { useRouter } from "next/navigation";

export default function useAuthCheck() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get("/getdata");
      if (response.data.success) {
        setIsAuthenticated(true);
        router.push("/lessons");
      } else {
        setIsAuthenticated(false);
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { loading, isAuthenticated };
}