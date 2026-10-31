import { type ComponentType, Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "wouter";
import { RequireRole } from "@/components/common/RequireRole";
import { LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { AuthWrapper, getAccessToken, useAccess } from "@/features/auth";
import { ShopLayout } from "./layouts/ShopLayout";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ProfilePage = lazy(() => import("@/pages/account/ProfilePage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const ProductListPage = lazy(() => import("@/pages/product/ProductListPage"));
const ProductCreatePage = lazy(() => import("@/pages/product/ProductCreatePage"));
const ProductDetailPage = lazy(() => import("@/pages/product/ProductDetailPage"));
const ProductEditPage = lazy(() => import("@/pages/product/ProductEditPage"));
const FarmRegistrationPage = lazy(() => import("@/pages/farm-registration/FarmRegistrationPage"));
const ProductApprovalPage = lazy(() => import("@/pages/product/ProductApprovalPage"));
const ProductGroupListPage = lazy(() => import("@/pages/product-group/ProductGroupListPage"));
const ProductGroupDetailPage = lazy(() => import("@/pages/product-group/ProductGroupDetailPage"));
const InventoryPage = lazy(() => import("@/pages/inventory/InventoryPage"));
const InventoryHistoryPage = lazy(() => import("@/pages/inventory/InventoryHistoryPage"));
const CustomerListPage = lazy(() => import("@/pages/customer/CustomerListPage"));
const CustomerDetailPage = lazy(() => import("@/pages/customer/CustomerDetailPage"));
const OrderDetailPage = lazy(() => import("@/pages/order/OrderDetailPage"));
const DispatchTeamListPage = lazy(() => import("@/pages/dispatch-team/DispatchTeamListPage"));
const DispatchTeamFormPage = lazy(() => import("@/pages/dispatch-team/DispatchTeamFormPage"));
const OrderListPage = lazy(() => import("@/pages/order/OrderListPage"));
const AgencyListPage = lazy(() => import("@/pages/agency/AgencyListPage"));
const AgencyDetailPage = lazy(() => import("@/pages/agency/AgencyDetailPage"));
const ReviewListPage = lazy(() => import("@/pages/review/ReviewListPage"));
const StaffListPage = lazy(() => import("@/pages/staff/StaffListPage"));
const ReportPage = lazy(() => import("@/pages/report/ReportPage"));
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
const DispatchTeamFormRoute = rootOnly(DispatchTeamFormPage);

/** Staff work from their order queue; the dashboard shows shop-wide numbers they shouldn't see */
function DashboardRoute() {
  const { isStaff, isLoading } = useAccess();
  if (isLoading) return <LoadingBlock />;
  return isStaff ? <Redirect to={ROUTES.orders} replace /> : <DashboardPage />;
}
const AgencyListRoute = rootOnly(AgencyListPage);
const AgencyDetailRoute = rootOnly(AgencyDetailPage);

function ProtectedRoutes() {
  return (
    <AuthWrapper>
      <ShopLayout>
        <Suspense fallback={<LoadingBlock />}>
          <Switch>
            <Route path={ROUTES.dashboard} component={DashboardRoute} />
            {/* Static segments before productDetail(":id") */}
            <Route path={ROUTES.productApproval} component={ApprovalRoute} />
            <Route path={ROUTES.productCreate} component={ProductCreatePage} />
            <Route path={ROUTES.productEdit(":id")} component={ProductEditPage} />
            <Route path={ROUTES.productDetail(":id")} component={ProductDetailPage} />
            <Route path={ROUTES.products} component={ProductListPage} />
            <Route path={ROUTES.farmRegistrations} component={FarmRegistrationPage} />
            <Route path={ROUTES.productGroupDetail(":id")} component={ProductGroupDetailPage} />
            <Route path={ROUTES.productGroups} component={ProductGroupListPage} />
            <Route path={ROUTES.inventoryHistory(":productId")} component={InventoryHistoryPage} />
            <Route path={ROUTES.inventory} component={InventoryPage} />
            <Route path={ROUTES.customerDetail(":id")} component={CustomerDetailPage} />
            <Route path={ROUTES.customers} component={CustomerListPage} />
            <Route path={ROUTES.orderDetail(":id")} component={OrderDetailPage} />
            <Route path={ROUTES.dispatchTeams} component={DispatchTeamListPage} />
            <Route path={ROUTES.dispatchTeamCreate} component={DispatchTeamFormRoute} />
            <Route path={ROUTES.dispatchTeamEdit(":id")} component={DispatchTeamFormRoute} />
            <Route path={ROUTES.orders} component={OrderListPage} />
            <Route path={ROUTES.agencyDetail(":id")} component={AgencyDetailRoute} />
            <Route path={ROUTES.agencies} component={AgencyListRoute} />
            <Route path={ROUTES.reviews} component={ReviewListPage} />
            <Route path={`${ROUTES.reports}/:kind`} component={ReportPage} />
            <Route path={ROUTES.reports}>
              <Redirect to={ROUTES.report("agency")} replace />
            </Route>
            <Route path={ROUTES.staff} component={StaffListPage} />
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
