import { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();
  return useMemo(
    () => ({
      push: (to: string) => navigate(to),
      replace: (to: string) => navigate(to, { replace: true }),
      back: () => navigate(-1),
    }),
    [navigate]
  );
}

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  const [params] = useRouterSearchParams();
  return params;
}

