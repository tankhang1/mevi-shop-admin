import { type ComponentType, Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "wouter";
import { RequireRole } from "@/components/common/RequireRole";
import { LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { AuthWrapper, getAccessToken } from "@/features/auth";
import { ShopLayout } from "./layouts/ShopLayout";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ProfilePage = lazy(() => import("@/pages/account/ProfilePage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const ProductListPage = lazy(() => import("@/pages/product/ProductListPage"));
const ProductCreatePage = lazy(() => import("@/pages/product/ProductCreatePage"));
const ProductDetailPage = lazy(() => import("@/pages/product/ProductDetailPage"));
const ProductEditPage = lazy(() => import("@/pages/product/ProductEditPage"));
const ProductApprovalPage = lazy(() => import("@/pages/product/ProductApprovalPage"));
const OrderListPage = lazy(() => import("@/pages/order/OrderListPage"));
const AgencyListPage = lazy(() => import("@/pages/agency/AgencyListPage"));
const AgencyDetailPage = lazy(() => import("@/pages/agency/AgencyDetailPage"));
const ReviewListPage = lazy(() => import("@/pages/review/ReviewListPage"));
const MyShopPage = lazy(() => import("@/pages/shop/MyShopPage"));
const ShopListPage = lazy(() => import("@/pages/shop/ShopListPage"));
const ShopDetailPage = lazy(() => import("@/pages/shop/ShopDetailPage"));

/** Mevi staff only — backend also answers 403 for shop admins */
const rootOnly = (Page: ComponentType) =>
  function RootOnly() {
    return (
      <RequireRole root>
        <Page />
      </RequireRole>
    );
  };
const ApprovalRoute = rootOnly(ProductApprovalPage);
const AgencyListRoute = rootOnly(AgencyListPage);
const AgencyDetailRoute = rootOnly(AgencyDetailPage);

function ProtectedRoutes() {
  return (
    <AuthWrapper>
      <ShopLayout>
        <Suspense fallback={<LoadingBlock />}>
          <Switch>
            <Route path={ROUTES.dashboard} component={DashboardPage} />
            {/* Static segments before productDetail(":id") */}
            <Route path={ROUTES.productApproval} component={ApprovalRoute} />
            <Route path={ROUTES.productCreate} component={ProductCreatePage} />
            <Route path={ROUTES.productEdit(":id")} component={ProductEditPage} />
            <Route path={ROUTES.productDetail(":id")} component={ProductDetailPage} />
            <Route path={ROUTES.products} component={ProductListPage} />
            <Route path={ROUTES.orders} component={OrderListPage} />
            <Route path={ROUTES.agencyDetail(":id")} component={AgencyDetailRoute} />
            <Route path={ROUTES.agencies} component={AgencyListRoute} />
            <Route path={ROUTES.reviews} component={ReviewListPage} />
            <Route path={ROUTES.myShop} component={MyShopPage} />
            <Route path={ROUTES.shopDetail(":id")} component={ShopDetailPage} />
            <Route path={ROUTES.shops} component={ShopListPage} />
            <Route path={ROUTES.profile} component={ProfilePage} />
            <Route>
              <Redirect to={ROUTES.dashboard} replace />
            </Route>
          </Switch>
        </Suspense>
      </ShopLayout>
    </AuthWrapper>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <Switch>
        <Route path={ROUTES.login}>
          {getAccessToken() ? <Redirect to={ROUTES.dashboard} replace /> : <LoginPage />}
        </Route>
        <Route component={ProtectedRoutes} />
      </Switch>
    </Suspense>
  );
}
