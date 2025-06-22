
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const LoginPage = lazy(() => import("../pages/user/LoginPage"));
const SignupPage = lazy(() => import("../pages/user/SignupPage"));

const DashboardMainPage = lazy(() => import("../pages/dashboard/DashboardMainPage"));
const Dashboard2Page = lazy(() => import("../pages/dashboard/Dashboard2Page"));

const AddTimePage = lazy(() => import("../pages/plan/AddTimePage"));


const LoadingScreen = () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <h2>페이지 로딩 중...</h2>
    </div>
  );

const router = createBrowserRouter([
    {
        path: "",
        element:(
                <MainLayout />
        ),
        children: [
            {path: "/", element: <Suspense fallback={<LoadingScreen />}><DashboardMainPage /></Suspense>},
            {path: "/dashboard1", element: <Suspense fallback={<LoadingScreen />}><DashboardMainPage /></Suspense>},

            {path: "/dashboard2", element: <Suspense fallback={<LoadingScreen />}><Dashboard2Page /></Suspense>},

            {path: "/login", element: <Suspense fallback={<LoadingScreen />}><LoginPage /></Suspense>},
            {path: "/signup", element: <Suspense fallback={<LoadingScreen />}><SignupPage /></Suspense>},

            {path: "/addtime", element: <Suspense fallback={<LoadingScreen />}><AddTimePage /></Suspense>},
          
        ]

    }
])

export default router;