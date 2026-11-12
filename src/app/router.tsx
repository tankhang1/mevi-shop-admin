import { type ComponentType, Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "wouter";
import { RequireRole } from "@/components/common/RequireRole";
import { LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { AuthWrapper, getAccessToken, useAccess } from "@/features/auth";
import { ShopLayout } from "./layouts/ShopLayout";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ProfilePage = lazy(() => import("@/pages/account/ProfilePage"));
// const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const ProductListPage = lazy(() => import("@/pages/product/ProductListPage"));
const ProductCreatePage = lazy(
  () => import("@/pages/product/ProductCreatePage"),
);
const ProductDetailPage = lazy(
  () => import("@/pages/product/ProductDetailPage"),
);
const ProductEditPage = lazy(() => import("@/pages/product/ProductEditPage"));
const FarmRegistrationPage = lazy(
  () => import("@/pages/farm-registration/FarmRegistrationPage"),
);
const ProductApprovalPage = lazy(
  () => import("@/pages/product/ProductApprovalPage"),
);
const ProductGroupListPage = lazy(
  () => import("@/pages/product-group/ProductGroupListPage"),
);
const ProductGroupDetailPage = lazy(
  () => import("@/pages/product-group/ProductGroupDetailPage"),
);
const InventoryPage = lazy(() => import("@/pages/inventory/InventoryPage"));
const InventoryHistoryPage = lazy(
  () => import("@/pages/inventory/InventoryHistoryPage"),
);
const CustomerListPage = lazy(
  () => import("@/pages/customer/CustomerListPage"),
);
const CustomerDetailPage = lazy(
  () => import("@/pages/customer/CustomerDetailPage"),
);
const OrderDetailPage = lazy(() => import("@/pages/order/OrderDetailPage"));
const DispatchTeamListPage = lazy(
  () => import("@/pages/dispatch-team/DispatchTeamListPage"),
);
const DispatchTeamFormPage = lazy(
  () => import("@/pages/dispatch-team/DispatchTeamFormPage"),
);
const OrderListPage = lazy(() => import("@/pages/order/OrderListPage"));
const AgencyListPage = lazy(() => import("@/pages/agency/AgencyListPage"));
const AgencyDetailPage = lazy(() => import("@/pages/agency/AgencyDetailPage"));
const ReviewListPage = lazy(() => import("@/pages/review/ReviewListPage"));
const StaffListPage = lazy(() => import("@/pages/staff/StaffListPage"));
const ReportPage = lazy(() => import("@/pages/report/ReportPage"));
const AgencyReportPage = lazy(() => import("@/pages/report/AgencyReportPage"));
const MyShopPage = lazy(() => import("@/pages/shop/MyShopPage"));
const StorefrontBannersPage = lazy(
  () => import("@/pages/shop/StorefrontBannersPage"),
);
const StorefrontHighlightsPage = lazy(
  () => import("@/pages/shop/StorefrontHighlightsPage"),
);
const StorefrontFaqPage = lazy(() => import("@/pages/shop/StorefrontFaqPage"));
const ShopListPage = lazy(() => import("@/pages/shop/ShopListPage"));
const ShopDetailPage = lazy(() => import("@/pages/shop/ShopDetailPage"));
const PartnerContactListPage = lazy(
  () => import("@/pages/partner/PartnerContactListPage"),
);

/** Mevi staff only — backend also answers 403 for shop admins */
const rootOnly = (Page: ComponentType) =>
  function RootOnly() {
    return (
      <RequireRole root>
        <Page />
      </RequireRole>
    );
  };
const superAdminOnly = (Page: ComponentType) =>
  function SuperAdminOnly() {
    return (
      <RequireRole superAdmin>
        <Page />
      </RequireRole>
    );
  };
const ApprovalRoute = rootOnly(ProductApprovalPage);
const FarmRegistrationRoute = rootOnly(FarmRegistrationPage);
const ProductCreateRoute = rootOnly(ProductCreatePage);
const ProductEditRoute = rootOnly(ProductEditPage);
const ProductGroupListRoute = rootOnly(ProductGroupListPage);
const ProductGroupDetailRoute = rootOnly(ProductGroupDetailPage);
const InventoryRoute = rootOnly(InventoryPage);
const InventoryHistoryRoute = rootOnly(InventoryHistoryPage);
const DispatchTeamListRoute = superAdminOnly(DispatchTeamListPage);
const DispatchTeamFormRoute = superAdminOnly(DispatchTeamFormPage);
const StaffListRoute = rootOnly(StaffListPage);
const ShopListRoute = rootOnly(ShopListPage);
const ShopDetailRoute = rootOnly(ShopDetailPage);
const AgencyListRoute = rootOnly(AgencyListPage);
const AgencyDetailRoute = rootOnly(AgencyDetailPage);
const AgencyReportRoute = rootOnly(AgencyReportPage);
const PartnerContactListRoute = rootOnly(PartnerContactListPage);
const StorefrontHighlightsRoute = rootOnly(StorefrontHighlightsPage);
const StorefrontFaqRoute = rootOnly(StorefrontFaqPage);

/** Staff work from their order queue; dashboard is hidden temporarily */
function DashboardRoute() {
  const { isStaff, isLoading } = useAccess();
  if (isLoading) return <LoadingBlock />;
  return isStaff ? (
    <Redirect to={ROUTES.orders} replace />
  ) : (
    <Redirect to={ROUTES.products} replace />
  );
}

function ReportsIndexRoute() {
  const { isRoot } = useAccess();
  return (
    <Redirect
      to={isRoot ? ROUTES.report("agency") : ROUTES.report("sales")}
      replace
    />
  );
}

function ProtectedRoutes() {
  return (
    <AuthWrapper>
      <ShopLayout>
        <Suspense fallback={<LoadingBlock />}>
          <Switch>
            <Route path={ROUTES.dashboard} component={DashboardRoute} />
            {/* Static segments before productDetail(":id") */}
            <Route path={ROUTES.productApproval} component={ApprovalRoute} />
            <Route path={ROUTES.productCreate} component={ProductCreateRoute} />
            <Route
              path={ROUTES.productEdit(":id")}
              component={ProductEditRoute}
            />
            <Route
              path={ROUTES.productDetail(":id")}
              component={ProductDetailPage}
            />
            <Route path={ROUTES.products} component={ProductListPage} />
            <Route
              path={ROUTES.farmRegistrations}
              component={FarmRegistrationRoute}
            />
            <Route
              path={ROUTES.productGroupDetail(":id")}
              component={ProductGroupDetailRoute}
            />
            <Route
              path={ROUTES.productGroups}
              component={ProductGroupListRoute}
            />
            <Route
              path={ROUTES.inventoryHistory(":productId")}
              component={InventoryHistoryRoute}
            />
            <Route path={ROUTES.inventory} component={InventoryRoute} />
            <Route
              path={ROUTES.customerDetail(":id")}
              component={CustomerDetailPage}
            />
            <Route path={ROUTES.customers} component={CustomerListPage} />
            <Route
              path={ROUTES.orderDetail(":id")}
              component={OrderDetailPage}
            />
            <Route
              path={ROUTES.dispatchTeams}
              component={DispatchTeamListRoute}
            />
            <Route
              path={ROUTES.dispatchTeamCreate}
              component={DispatchTeamFormRoute}
            />
            <Route
              path={ROUTES.dispatchTeamEdit(":id")}
              component={DispatchTeamFormRoute}
            />
            <Route path={ROUTES.orders} component={OrderListPage} />
            <Route
              path={ROUTES.agencyDetail(":id")}
              component={AgencyDetailRoute}
            />
            <Route path={ROUTES.agencies} component={AgencyListRoute} />
            <Route
              path={ROUTES.partnerContactRequests}
              component={PartnerContactListRoute}
            />
            <Route path={ROUTES.reviews} component={ReviewListPage} />
            <Route
              path={ROUTES.agencyReport(":id")}
              component={AgencyReportRoute}
            />
            <Route path={`${ROUTES.reports}/:kind`} component={ReportPage} />
            <Route path={ROUTES.reports} component={ReportsIndexRoute} />
            <Route path={ROUTES.staff} component={StaffListRoute} />
            <Route
              path={ROUTES.storefrontBanners}
              component={StorefrontBannersPage}
            />
            <Route
              path={ROUTES.storefrontHighlights}
              component={StorefrontHighlightsRoute}
            />
            <Route path={ROUTES.storefrontFaq} component={StorefrontFaqRoute} />
            <Route path={ROUTES.myShop} component={MyShopPage} />
            <Route
              path={ROUTES.shopDetail(":id")}
              component={ShopDetailRoute}
            />
            <Route path={ROUTES.shops} component={ShopListRoute} />
            <Route path={ROUTES.profile} component={ProfilePage} />
            <Route>
              <Redirect to={ROUTES.products} replace />
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
          {getAccessToken() ? (
            <Redirect to={ROUTES.products} replace />
          ) : (
            <LoginPage />
          )}
        </Route>
        <Route component={ProtectedRoutes} />
      </Switch>
    </Suspense>
  );
}
