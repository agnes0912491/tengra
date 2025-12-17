/**
 * Admin UI Component Library
 * 
 * Re-exports all admin UI components for easy imports.
 * Usage: import { AdminCard, AdminTable, AdminModal } from "@/components/admin/ui";
 */

// Cards
export {
  AdminCard,
  AdminCardHeader,
  AdminCardContent,
  AdminStatCard,
} from "./admin-card";

// Tables
export { AdminTable, AdminPagination } from "./admin-table";

// Modals
export { AdminModal, AdminModalButton } from "./admin-modal";

// Forms
export {
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminSwitch,
  AdminCheckbox,
  AdminBadge,
} from "./admin-form";

// Existing components
export { default as BarList } from "./bar-list";
export { default as ChartCard } from "./chart-card";
export { default as EmptyState } from "./empty-state";
export { default as MiniBars } from "./mini-bars";
export { default as Skeleton } from "./skeleton";
export { default as StatCard } from "./stat-card";
