import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  BarChart2,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Edit3,
  ImageIcon,
  IndianRupee,
  LogOut,
  MapPin,
  Minus,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Trash2,
  TrendingUp,
  UserCog,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | "login"
  | "branch-select"
  | "dashboard"
  | "billing"
  | "payment"
  | "bill-preview"
  | "menu"
  | "reports"
  | "employees"
  | "settings";

type Category = "Breakfast" | "Lunch" | "Dinner" | "Beverages" | "Snacks";
type PaymentMethod = "Cash" | "UPI" | "Card";
type Role = "owner" | "staff";

interface MenuItem {
  id: string;
  branchId: number;
  name: string;
  price: number;
  category: Category;
  available: boolean;
  imageUrl?: string;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  branchId: number;
  billNumber: string;
  items: OrderItem[];
  customerName: string;
  customerMobile: string;
  subtotal: number;
  gstAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: number;
}

interface Employee {
  id: string;
  branchId: number;
  name: string;
  role: string;
  salary: number;
  salaryPaid: boolean;
}

interface GSTSettings {
  branchId: number;
  enabled: boolean;
  gstNumber: string;
  percentage: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const BRANCHES = [
  { id: 1, name: "Gobinath Hotel – Sethurapatti", short: "Sethurapatti" },
  { id: 2, name: "Gobinath Hotel – JJ College", short: "JJ College" },
];

const CATEGORIES: Category[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Beverages",
  "Snacks",
];

const CATEGORY_EMOJIS: Record<Category, string> = {
  Breakfast: "🌅",
  Lunch: "☀️",
  Dinner: "🌙",
  Beverages: "🥤",
  Snacks: "🍿",
};

const SEED_MENU_BRANCH1: Omit<MenuItem, "id">[] = [
  {
    branchId: 1,
    name: "Idli",
    price: 25,
    category: "Breakfast",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 1,
    name: "Dosa",
    price: 35,
    category: "Breakfast",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 1,
    name: "Pongal",
    price: 30,
    category: "Breakfast",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 1,
    name: "Meals",
    price: 80,
    category: "Lunch",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 1,
    name: "Chicken Biryani",
    price: 120,
    category: "Lunch",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 1,
    name: "Veg Biryani",
    price: 90,
    category: "Lunch",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 1,
    name: "Chicken Fry",
    price: 150,
    category: "Dinner",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 1,
    name: "Parotta",
    price: 40,
    category: "Dinner",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 1,
    name: "Tea",
    price: 15,
    category: "Beverages",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 1,
    name: "Coffee",
    price: 20,
    category: "Beverages",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 1,
    name: "Bonda",
    price: 20,
    category: "Snacks",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 1,
    name: "Samosa",
    price: 15,
    category: "Snacks",
    available: true,
    imageUrl: "",
  },
];

const SEED_MENU_BRANCH2: Omit<MenuItem, "id">[] = [
  {
    branchId: 2,
    name: "Idli",
    price: 30,
    category: "Breakfast",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 2,
    name: "Dosa",
    price: 40,
    category: "Breakfast",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 2,
    name: "Pongal",
    price: 35,
    category: "Breakfast",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 2,
    name: "Meals",
    price: 90,
    category: "Lunch",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 2,
    name: "Chicken Biryani",
    price: 130,
    category: "Lunch",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 2,
    name: "Veg Biryani",
    price: 100,
    category: "Lunch",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 2,
    name: "Chicken Fry",
    price: 160,
    category: "Dinner",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 2,
    name: "Parotta",
    price: 45,
    category: "Dinner",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 2,
    name: "Tea",
    price: 20,
    category: "Beverages",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 2,
    name: "Coffee",
    price: 25,
    category: "Beverages",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 2,
    name: "Bonda",
    price: 25,
    category: "Snacks",
    available: true,
    imageUrl: "",
  },
  {
    branchId: 2,
    name: "Samosa",
    price: 20,
    category: "Snacks",
    available: true,
    imageUrl: "",
  },
];

// ── localStorage helpers ────────────────────────────────────────────────────

function lsGet<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function generateBillNumber(branchId: number, orders: Order[]): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const branchPrefix = branchId === 1 ? "SET" : "JJC";
  const todayOrders = orders.filter(
    (o) =>
      o.branchId === branchId &&
      new Date(o.createdAt).toDateString() === today.toDateString(),
  );
  const seq = String(todayOrders.length + 1).padStart(3, "0");
  return `${branchPrefix}-${dateStr}-${seq}`;
}

function formatINR(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Seed data ────────────────────────────────────────────────────────────────

function initializeData() {
  if (!localStorage.getItem("pos_menu_items")) {
    const items: MenuItem[] = [
      ...SEED_MENU_BRANCH1.map((item) => ({ ...item, id: generateId() })),
      ...SEED_MENU_BRANCH2.map((item) => ({ ...item, id: generateId() })),
    ];
    lsSet("pos_menu_items", items);
  }
  if (!localStorage.getItem("pos_orders")) {
    lsSet("pos_orders", []);
  }
  if (!localStorage.getItem("pos_employees")) {
    const employees: Employee[] = [
      {
        id: generateId(),
        branchId: 1,
        name: "Ramu",
        role: "Waiter",
        salary: 8000,
        salaryPaid: true,
      },
      {
        id: generateId(),
        branchId: 1,
        name: "Selvam",
        role: "Cook",
        salary: 12000,
        salaryPaid: false,
      },
      {
        id: generateId(),
        branchId: 2,
        name: "Kannan",
        role: "Waiter",
        salary: 8000,
        salaryPaid: true,
      },
      {
        id: generateId(),
        branchId: 2,
        name: "Mani",
        role: "Cashier",
        salary: 10000,
        salaryPaid: true,
      },
    ];
    lsSet("pos_employees", employees);
  }
  if (!localStorage.getItem("pos_gst_settings")) {
    const gst: GSTSettings[] = [
      { branchId: 1, enabled: false, gstNumber: "", percentage: 5 },
      { branchId: 2, enabled: false, gstNumber: "", percentage: 5 },
    ];
    lsSet("pos_gst_settings", gst);
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  useEffect(() => {
    initializeData();
  }, []);

  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<Role>("staff");
  const [activeBranch, setActiveBranch] = useState<number>(1);
  const [loginType, setLoginType] = useState<"owner" | "staff" | null>(null);
  const [pin, setPin] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() =>
    lsGet<MenuItem[]>("pos_menu_items", []),
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    lsGet<Order[]>("pos_orders", []),
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    lsGet<Employee[]>("pos_employees", []),
  );
  const [gstSettings, setGstSettings] = useState<GSTSettings[]>(() =>
    lsGet<GSTSettings[]>("pos_gst_settings", [
      { branchId: 1, enabled: false, gstNumber: "", percentage: 5 },
      { branchId: 2, enabled: false, gstNumber: "", percentage: 5 },
    ]),
  );

  // Cart state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [activeCategory, setActiveCategory] = useState<"All" | Category>("All");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Sync to localStorage
  useEffect(() => {
    lsSet("pos_menu_items", menuItems);
  }, [menuItems]);
  useEffect(() => {
    lsSet("pos_orders", orders);
  }, [orders]);
  useEffect(() => {
    lsSet("pos_employees", employees);
  }, [employees]);
  useEffect(() => {
    lsSet("pos_gst_settings", gstSettings);
  }, [gstSettings]);

  const activeBranchObj = BRANCHES.find((b) => b.id === activeBranch)!;
  const activeGST = gstSettings.find((g) => g.branchId === activeBranch) ?? {
    branchId: activeBranch,
    enabled: false,
    gstNumber: "",
    percentage: 5,
  };

  const branchMenuItems = menuItems.filter(
    (item) => item.branchId === activeBranch && item.available,
  );

  // ── Login handlers ──────────────────────────────────────────────────────

  function handleLoginTypeSelect(type: "owner" | "staff") {
    setLoginType(type);
    setPin("");
    setPinError("");
  }

  function handlePinDigit(digit: string) {
    if (pin.length < 4) {
      setPin((p) => p + digit);
      setPinError("");
    }
  }

  function handlePinClear() {
    setPin((p) => p.slice(0, -1));
    setPinError("");
  }

  function handlePinClearAll() {
    setPin("");
    setPinError("");
  }

  function handleLogin() {
    if (loginType === "owner") {
      if (pin === "1234") {
        setRole("owner");
        setPin("");
        setPinError("");
        setLoginType(null);
        setScreen("branch-select");
      } else {
        setPinError("Invalid PIN. Please try again.");
        setPin("");
      }
    } else if (loginType === "staff") {
      if (pin === "0000") {
        setRole("staff");
        setPin("");
        setPinError("");
        setLoginType(null);
        setScreen("billing");
      } else {
        setPinError("Invalid PIN. Please try again.");
        setPin("");
      }
    }
  }

  function handleLogout() {
    setRole("staff");
    setActiveBranch(1);
    setLoginType(null);
    setPin("");
    setPinError("");
    setCart([]);
    setCustomerName("");
    setCustomerMobile("");
    setScreen("login");
  }

  // ── Cart handlers ──────────────────────────────────────────────────────

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItemId === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItemId === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ];
    });
  }

  function updateQty(menuItemId: string, delta: number) {
    setCart((prev) => {
      const updated = prev
        .map((ci) =>
          ci.menuItemId === menuItemId
            ? { ...ci, quantity: ci.quantity + delta }
            : ci,
        )
        .filter((ci) => ci.quantity > 0);
      return updated;
    });
  }

  function removeFromCart(menuItemId: string) {
    setCart((prev) => prev.filter((ci) => ci.menuItemId !== menuItemId));
  }

  function clearCart() {
    setCart([]);
    setCustomerName("");
    setCustomerMobile("");
  }

  const subtotal = cart.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);
  const gstAmount = activeGST.enabled
    ? (subtotal * activeGST.percentage) / 100
    : 0;
  const total = subtotal + gstAmount;

  // ── Payment / Bill ──────────────────────────────────────────────────────

  function completePayment() {
    const newOrder: Order = {
      id: generateId(),
      branchId: activeBranch,
      billNumber: generateBillNumber(activeBranch, orders),
      items: cart,
      customerName,
      customerMobile,
      subtotal,
      gstAmount,
      total,
      paymentMethod,
      createdAt: Date.now(),
    };
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    setCurrentOrder(newOrder);
    setScreen("bill-preview");
    toast.success(`Payment complete! Bill #${newOrder.billNumber}`);
  }

  function startNewOrder() {
    clearCart();
    setCurrentOrder(null);
    setCashReceived("");
    setPaymentMethod("Cash");
    setScreen("billing");
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  const navItems = useMemo(() => {
    const base = [
      {
        id: "billing",
        label: "Billing",
        icon: ShoppingCart,
        screen: "billing" as Screen,
      },
    ];
    if (role === "owner") {
      return [
        ...base,
        {
          id: "menu",
          label: "Menu",
          icon: UtensilsCrossed,
          screen: "menu" as Screen,
        },
        {
          id: "reports",
          label: "Reports",
          icon: BarChart2,
          screen: "reports" as Screen,
        },
        {
          id: "employees",
          label: "Employees",
          icon: Users,
          screen: "employees" as Screen,
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          screen: "settings" as Screen,
        },
      ];
    }
    return base;
  }, [role]);

  const showNav = [
    "dashboard",
    "billing",
    "menu",
    "reports",
    "employees",
    "settings",
  ].includes(screen);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <Toaster position="top-center" richColors />

      {/* Top Bar */}
      {showNav && (
        <TopBar
          role={role}
          branch={activeBranchObj}
          onSwitchBranch={() => setScreen("branch-select")}
          onLogout={handleLogout}
          screen={screen}
        />
      )}

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto ${showNav ? "pb-20" : ""}`}>
        {screen === "login" && (
          <LoginScreen
            loginType={loginType}
            pin={pin}
            pinError={pinError}
            onSelectType={handleLoginTypeSelect}
            onPinDigit={handlePinDigit}
            onPinClear={handlePinClear}
            onPinClearAll={handlePinClearAll}
            onLogin={handleLogin}
            onBack={() => setLoginType(null)}
          />
        )}

        {screen === "branch-select" && (
          <BranchSelectScreen
            onSelect={(id) => {
              setActiveBranch(id);
              setScreen("dashboard");
            }}
          />
        )}

        {screen === "dashboard" && role === "owner" && (
          <DashboardScreen
            branch={activeBranchObj}
            orders={orders}
            onNavigate={(s) => setScreen(s)}
          />
        )}

        {screen === "billing" && (
          <BillingScreen
            menuItems={branchMenuItems}
            cart={cart}
            activeCategory={activeCategory}
            customerName={customerName}
            customerMobile={customerMobile}
            subtotal={subtotal}
            gstAmount={gstAmount}
            total={total}
            gstEnabled={activeGST.enabled}
            gstPct={activeGST.percentage}
            onAddToCart={addToCart}
            onUpdateQty={updateQty}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
            onSetCategory={setActiveCategory}
            onSetCustomerName={setCustomerName}
            onSetCustomerMobile={setCustomerMobile}
            onProceedToPayment={() => setScreen("payment")}
            onBack={() => setScreen("dashboard")}
          />
        )}

        {screen === "payment" && (
          <PaymentScreen
            total={total}
            paymentMethod={paymentMethod}
            cashReceived={cashReceived}
            onSetMethod={setPaymentMethod}
            onSetCashReceived={setCashReceived}
            onComplete={completePayment}
            onBack={() => setScreen("billing")}
          />
        )}

        {screen === "bill-preview" && currentOrder && (
          <BillPreviewScreen
            order={currentOrder}
            branch={activeBranchObj}
            gstSettings={activeGST}
            role={role}
            onNewOrder={startNewOrder}
            onDashboard={() => setScreen("dashboard")}
          />
        )}

        {screen === "menu" && role === "owner" && (
          <MenuScreen
            menuItems={menuItems.filter((m) => m.branchId === activeBranch)}
            branchId={activeBranch}
            onUpdate={setMenuItems}
            allItems={menuItems}
            onBack={() => setScreen("dashboard")}
          />
        )}

        {screen === "reports" && role === "owner" && (
          <ReportsScreen
            orders={orders}
            onBack={() => setScreen("dashboard")}
          />
        )}

        {screen === "employees" && role === "owner" && (
          <EmployeesScreen
            employees={employees}
            branchId={activeBranch}
            onUpdate={setEmployees}
            allEmployees={employees}
            onBack={() => setScreen("dashboard")}
          />
        )}

        {screen === "settings" && role === "owner" && (
          <GSTSettingsScreen
            gstSettings={gstSettings}
            branchId={activeBranch}
            onUpdate={setGstSettings}
            onBack={() => setScreen("dashboard")}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <BottomNav
          items={navItems}
          currentScreen={screen}
          onNavigate={(s) => setScreen(s)}
        />
      )}
    </div>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────

function useHeaderClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function TopBar({
  role,
  branch,
  onSwitchBranch,
  onLogout,
}: {
  role: Role;
  branch: { name: string; short: string };
  onSwitchBranch: () => void;
  onLogout: () => void;
  screen: Screen;
}) {
  const now = useHeaderClock();

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 max-w-4xl mx-auto gap-3">
        {/* Left: Logo + Title + Branch */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Logo — circular, white border, shadow */}
          <div
            className="flex-shrink-0"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.90)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.20), 0 4px 12px rgba(0,0,0,0.30)",
            }}
          >
            <img
              src="/assets/uploads/modern-restaurant-logo-design-for-keeaap_FMTnl_lcRTG9KHviZ8Oxbw_iIsYXoF4R0OuTPt3-5QqLA_sd-1.jpeg"
              alt="Gobinath Hotel Logo"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Title + Location */}
          <div className="flex flex-col min-w-0">
            <span
              className="font-bold text-sm sm:text-base leading-tight truncate"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Gobinath Hotel POS
            </span>
            <span className="text-[11px] opacity-80 truncate font-body leading-tight">
              {role === "owner" ? branch.short : "Staff Mode"}
            </span>
          </div>
        </div>

        {/* Right: Live Date & Time + Change Branch (owner only) + Logout */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Date & Time block */}
          <div className="text-right leading-tight" data-ocid="topbar.datetime">
            <p className="text-[11px] sm:text-xs font-semibold opacity-95 font-body">
              {dateStr}
            </p>
            <p className="text-[11px] sm:text-xs opacity-75 font-body">
              {timeStr}
            </p>
          </div>

          {/* Change Branch — owner only */}
          {role === "owner" && (
            <>
              <span className="text-primary-foreground opacity-50 text-sm select-none">
                |
              </span>
              <button
                type="button"
                data-ocid="topbar.change_branch_button"
                onClick={onSwitchBranch}
                className="flex items-center gap-1.5 h-9 px-2 rounded-lg text-xs font-medium text-primary-foreground hover:bg-white/15 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">Change Branch</span>
                <span className="sm:hidden">Branch</span>
              </button>
            </>
          )}

          {/* Logout */}
          <Button
            size="sm"
            variant="ghost"
            data-ocid="topbar.logout_button"
            className="text-primary-foreground hover:bg-white/20 h-8 w-8 p-0"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

// ── BottomNav ─────────────────────────────────────────────────────────────────

function BottomNav({
  items,
  currentScreen,
  onNavigate,
}: {
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    screen: Screen;
  }[];
  currentScreen: Screen;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg">
      <div className="flex items-center justify-around max-w-4xl mx-auto px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.screen;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}_tab`}
              onClick={() => onNavigate(item.screen)}
              className={`flex flex-col items-center justify-center py-2 px-3 flex-1 min-h-[60px] transition-colors font-body ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 mb-0.5 ${isActive ? "text-primary" : ""}`}
              />
              <span
                className={`text-[11px] font-medium ${isActive ? "text-primary font-semibold" : ""}`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 h-0.5 w-8 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ── LoginScreen ───────────────────────────────────────────────────────────────

function LoginScreen({
  loginType,
  pin,
  pinError,
  onSelectType,
  onPinDigit,
  onPinClear,
  onPinClearAll,
  onLogin,
  onBack: _onBack,
}: {
  loginType: "owner" | "staff" | null;
  pin: string;
  pinError: string;
  onSelectType: (t: "owner" | "staff") => void;
  onPinDigit: (d: string) => void;
  onPinClear: () => void;
  onPinClearAll: () => void;
  onLogin: () => void;
  onBack: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0F5132 0%, #0d3b26 40%, #0a2e35 70%, #0b3d3d 100%)",
      }}
    >
      {/* Inner scroll container — constrained to viewport height */}
      <div className="flex flex-col items-center w-full px-5 sm:px-8 max-h-screen overflow-y-auto py-4 sm:py-6 scrollbar-hide">
        {/* Logo + Title — always visible at top */}
        <div className="flex flex-col items-center mb-5 animate-fade-in flex-shrink-0">
          <div className="mb-3 rounded-2xl shadow-2xl overflow-hidden border-2 border-white/20 w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
            <img
              src="/assets/uploads/modern-restaurant-logo-design-for-keeaap_FMTnl_lcRTG9KHviZ8Oxbw_iIsYXoF4R0OuTPt3-5QqLA_sd-1.jpeg"
              alt="Gobinath Hotel Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-1 tracking-tight text-center drop-shadow-lg">
            Gobinath Hotel
          </h1>
          <p className="text-white/60 text-xs sm:text-sm font-body tracking-[0.2em] uppercase">
            Restaurant Management System
          </p>
        </div>

        {/* Login Card */}
        <div
          className="w-full max-w-xs sm:max-w-sm rounded-3xl shadow-2xl p-5 sm:p-6 animate-scale-in flex-shrink-0"
          style={{
            background: "rgba(248, 245, 240, 0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          {loginType === null ? (
            <>
              <h2 className="text-center font-display text-xl font-bold text-foreground mb-5">
                Select Login Type
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Owner Login */}
                <button
                  type="button"
                  data-ocid="login.owner_button"
                  onClick={() => onSelectType("owner")}
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 active:scale-95 transition-all min-h-[120px]"
                  style={{
                    borderColor: "#0F5132",
                    background: "rgba(15,81,50,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(15,81,50,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(15,81,50,0.06)";
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(15,81,50,0.12)" }}
                  >
                    <Shield className="h-7 w-7" style={{ color: "#0F5132" }} />
                  </div>
                  <span
                    className="font-semibold text-sm text-center leading-tight"
                    style={{ color: "#0F5132" }}
                  >
                    Owner Login
                  </span>
                </button>
                {/* Staff Login */}
                <button
                  type="button"
                  data-ocid="login.staff_button"
                  onClick={() => onSelectType("staff")}
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 active:scale-95 transition-all min-h-[120px]"
                  style={{
                    borderColor: "#FF7A00",
                    background: "rgba(255,122,0,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,122,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,122,0,0.06)";
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,122,0,0.12)" }}
                  >
                    <UserCog className="h-7 w-7" style={{ color: "#FF7A00" }} />
                  </div>
                  <span
                    className="font-semibold text-sm text-center leading-tight"
                    style={{ color: "#FF7A00" }}
                  >
                    Staff Login
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* PIN screen header — no logo, no close button */}
              <div className="flex items-center justify-center mb-4">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  {loginType === "owner" ? (
                    <>
                      <Shield
                        className="h-5 w-5"
                        style={{ color: "#0F5132" }}
                      />
                      Owner PIN
                    </>
                  ) : (
                    <>
                      <UserCog
                        className="h-5 w-5"
                        style={{ color: "#FF7A00" }}
                      />
                      Staff PIN
                    </>
                  )}
                </h2>
              </div>

              {/* PIN dots */}
              <div
                className="flex justify-center gap-4 mb-5"
                data-ocid="login.pin_input"
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`pin-dot ${i < pin.length ? "filled" : ""}`}
                    style={
                      loginType === "staff"
                        ? ({
                            "--pin-color": "#FF7A00",
                          } as React.CSSProperties)
                        : undefined
                    }
                  />
                ))}
              </div>

              {/* Error */}
              {pinError && (
                <p
                  className="text-destructive text-sm text-center mb-3 font-medium animate-fade-in"
                  data-ocid="login.error_state"
                >
                  {pinError}
                </p>
              )}

              {/* Numpad — Row 4: C, 0, ⌫ */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                  <button
                    type="button"
                    key={d}
                    className="numpad-btn"
                    onClick={() => onPinDigit(d)}
                  >
                    {d}
                  </button>
                ))}
                {/* Row 4: C, 0, ⌫ */}
                <button
                  type="button"
                  data-ocid="login.clear_button"
                  className="numpad-btn font-bold"
                  style={{ color: "#0F5132" }}
                  onClick={onPinClearAll}
                >
                  C
                </button>
                <button
                  type="button"
                  className="numpad-btn"
                  onClick={() => onPinDigit("0")}
                >
                  0
                </button>
                <button
                  type="button"
                  data-ocid="login.backspace_button"
                  className="numpad-btn text-destructive"
                  onClick={onPinClear}
                >
                  ⌫
                </button>
              </div>

              {/* Login button */}
              <Button
                data-ocid="login.submit_button"
                className="w-full h-12 text-base font-semibold rounded-xl text-white border-0"
                style={{
                  background: loginType === "owner" ? "#0F5132" : "#FF7A00",
                }}
                disabled={pin.length < 4}
                onClick={onLogin}
              >
                <Check className="h-5 w-5 mr-2" />
                Login
              </Button>
            </>
          )}
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-5 flex-shrink-0"
          style={{ color: "#9ca3af" }}
        >
          Powered By NextYU Solution
        </p>
      </div>
    </div>
  );
}

// ── BranchSelectScreen ────────────────────────────────────────────────────────

const BRANCH_ICONS = [Store, Building2];

function BranchSelectScreen({ onSelect }: { onSelect: (id: number) => void }) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.15,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: "easeOut" as const },
    },
  };

  return (
    <div
      data-ocid="branch_select.page"
      className="min-h-screen flex flex-col items-center justify-center p-5 sm:p-8"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.22 0.07 151) 0%, oklch(0.18 0.06 162) 50%, oklch(0.15 0.05 155) 100%)",
      }}
    >
      {/* Logo + Header */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8 flex flex-col items-center"
      >
        {/* Circular logo with glow */}
        <div
          className="mb-5 flex-shrink-0"
          style={{
            width: "88px",
            height: "88px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "1.5px solid rgba(255,255,255,0.28)",
            boxShadow:
              "0 8px 32px 0 rgba(0,0,0,0.32), 0 0 0 4px rgba(255,255,255,0.08), 0 0 24px 6px rgba(15,81,50,0.45)",
          }}
        >
          <img
            src="/assets/uploads/modern-restaurant-logo-design-for-keeaap_FMTnl_lcRTG9KHviZ8Oxbw_iIsYXoF4R0OuTPt3-5QqLA_sd-1.jpeg"
            alt="Gobinath Hotel Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
        <h1
          className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-1.5 text-center"
          style={{ fontFamily: "'Playfair Display', Fraunces, Georgia, serif" }}
        >
          Select Branch
        </h1>
        <p
          className="text-sm sm:text-base text-white/55 text-center"
          style={{ fontFamily: "Plus Jakarta Sans, Poppins, sans-serif" }}
        >
          Choose the branch you want to manage
        </p>
      </motion.div>

      {/* Branch cards — stacked vertical, full-width on mobile, centered on tablet+ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md flex flex-col gap-3"
      >
        {BRANCHES.map((branch, i) => {
          const Icon = BRANCH_ICONS[i] ?? Building2;

          return (
            <motion.button
              type="button"
              key={branch.id}
              data-ocid={`branch_select.item.${i + 1}`}
              variants={cardVariants}
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => onSelect(branch.id)}
              className="group relative flex items-center gap-4 px-5 py-4 sm:py-5 rounded-2xl border border-white/10 cursor-pointer transition-shadow duration-300 text-left w-full"
              style={{
                background: "oklch(0.975 0.006 85 / 0.97)",
                boxShadow:
                  "0 4px 24px 0 rgba(0,0,0,0.18), 0 1px 4px 0 rgba(0,0,0,0.10)",
              }}
            >
              {/* Hover highlight overlay */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(15,81,50,0.05) 0%, rgba(255,122,0,0.03) 100%)",
                }}
              />

              {/* Icon circle */}
              <div
                className="relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(15,81,50,0.10)",
                  boxShadow:
                    "0 2px 10px 0 rgba(15,81,50,0.15), 0 0 0 1.5px rgba(15,81,50,0.12)",
                }}
              >
                <Icon
                  className="h-6 w-6"
                  style={{ color: "oklch(0.28 0.08 151)" }}
                />
              </div>

              {/* Branch name — bold and clear */}
              <p
                className="flex-1 font-bold text-base sm:text-lg leading-snug truncate"
                style={{
                  fontFamily: "'Playfair Display', Fraunces, Georgia, serif",
                  color: "oklch(0.18 0.05 151)",
                }}
              >
                {branch.name}
              </p>

              {/* Arrow */}
              <ChevronRight
                className="flex-shrink-0 h-5 w-5 opacity-35 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all duration-300"
                style={{ color: "oklch(0.28 0.08 151)" }}
              />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Footer branding */}
      <motion.p
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="mt-10 text-xs text-white/30 text-center"
        style={{ fontFamily: "Plus Jakarta Sans, Poppins, sans-serif" }}
      >
        Powered By NextYU Solution
      </motion.p>
    </div>
  );
}

// ── DashboardScreen ───────────────────────────────────────────────────────────

const MODULE_CONFIG: {
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  screen: Screen;
  iconColor: string;
  bgColor: string;
  description: string;
}[] = [
  {
    label: "Billing",
    icon: ShoppingCart,
    screen: "billing",
    iconColor: "#0F5132",
    bgColor: "rgba(15,81,50,0.10)",
    description: "New orders & bills",
  },
  {
    label: "Menu",
    icon: UtensilsCrossed,
    screen: "menu",
    iconColor: "#FF7A00",
    bgColor: "rgba(255,122,0,0.10)",
    description: "Manage food items",
  },
  {
    label: "Reports",
    icon: BarChart2,
    screen: "reports",
    iconColor: "#1F7A8C",
    bgColor: "rgba(31,122,140,0.10)",
    description: "Sales analytics",
  },
  {
    label: "Employees",
    icon: Users,
    screen: "employees",
    iconColor: "#1E40AF",
    bgColor: "rgba(30,64,175,0.10)",
    description: "Staff management",
  },
  {
    label: "Settings",
    icon: Settings,
    screen: "settings",
    iconColor: "#6B7280",
    bgColor: "rgba(107,114,128,0.10)",
    description: "App configuration",
  },
];

function DashboardScreen({
  branch,
  orders,
  onNavigate,
}: {
  branch: { id: number; name: string; short: string };
  orders: Order[];
  onNavigate: (s: Screen) => void;
}) {
  const today = new Date().toDateString();
  const todayOrders = orders.filter(
    (o) =>
      o.branchId === branch.id &&
      new Date(o.createdAt).toDateString() === today,
  );
  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

  const itemCounts: Record<string, number> = {};
  for (const o of todayOrders) {
    for (const i of o.items) {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
    }
  }
  const topItem =
    Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
  };

  return (
    <div
      data-ocid="dashboard.page"
      className="max-w-4xl mx-auto p-4 pb-6 space-y-5"
      style={{ background: "oklch(var(--background))" }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "#0F5132",
              letterSpacing: "-0.01em",
            }}
          >
            Dashboard
          </h2>
          <p className="text-sm text-muted-foreground font-body mt-0.5">
            {branch.name}
          </p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-3"
        data-ocid="dashboard.stats_section"
      >
        {/* Today's Sales */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-3 sm:p-4 shadow-stat-card text-center border border-border"
          data-ocid="dashboard.sales_card"
        >
          <div
            className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
            style={{ background: "rgba(15,81,50,0.10)" }}
          >
            <IndianRupee className="h-4 w-4" style={{ color: "#0F5132" }} />
          </div>
          <p
            className="text-base sm:text-lg font-bold leading-tight"
            style={{ color: "#0F5132" }}
          >
            {formatINR(todaySales)}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 font-body">
            Today Sales
          </p>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-3 sm:p-4 shadow-stat-card text-center border border-border"
          data-ocid="dashboard.orders_card"
        >
          <div
            className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
            style={{ background: "rgba(255,122,0,0.10)" }}
          >
            <Package className="h-4 w-4" style={{ color: "#FF7A00" }} />
          </div>
          <p
            className="text-base sm:text-lg font-bold leading-tight"
            style={{ color: "#FF7A00" }}
          >
            {todayOrders.length}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 font-body">
            Total Orders
          </p>
        </motion.div>

        {/* Top Item */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-3 sm:p-4 shadow-stat-card text-center border border-border"
          data-ocid="dashboard.topitem_card"
        >
          <div
            className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
            style={{ background: "rgba(31,122,140,0.10)" }}
          >
            <TrendingUp className="h-4 w-4" style={{ color: "#1F7A8C" }} />
          </div>
          <p
            className="text-xs sm:text-sm font-bold leading-tight truncate"
            style={{ color: "#1F7A8C" }}
          >
            {topItem}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 font-body">
            Top Item
          </p>
        </motion.div>
      </motion.div>

      {/* Module Grid Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-body"
      >
        Modules
      </motion.p>

      {/* Module Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        data-ocid="dashboard.modules_section"
      >
        {MODULE_CONFIG.map((mod) => {
          const Icon = mod.icon;
          return (
            <motion.button
              type="button"
              key={mod.screen}
              data-ocid={`dashboard.${mod.label.toLowerCase()}_card`}
              variants={itemVariants}
              whileHover={{
                y: -4,
                boxShadow:
                  "0 10px 32px 0 rgba(15,81,50,0.15), 0 2px 8px 0 rgba(15,81,50,0.08)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(mod.screen)}
              className="flex flex-col items-start gap-3 bg-white rounded-2xl p-4 sm:p-5 shadow-card border border-border cursor-pointer min-h-[120px] sm:min-h-[140px] text-left transition-shadow duration-200"
            >
              {/* Icon circle */}
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: mod.bgColor }}
              >
                <Icon
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  style={{ color: mod.iconColor }}
                />
              </div>
              {/* Label + Description */}
              <div>
                <p
                  className="font-semibold text-sm sm:text-base font-body leading-tight"
                  style={{ color: "#0F5132" }}
                >
                  {mod.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-body leading-snug">
                  {mod.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Recent Orders */}
      {todayOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-card border border-border p-4"
          data-ocid="dashboard.recent_orders_section"
        >
          <h3
            className="font-semibold text-sm mb-3 flex items-center gap-2 font-body"
            style={{ color: "#0F5132" }}
          >
            <Clock className="h-4 w-4" style={{ color: "#1F7A8C" }} />
            Recent Orders Today
          </h3>
          <div className="space-y-2">
            {todayOrders
              .slice(-3)
              .reverse()
              .map((order, idx) => (
                <div
                  key={order.id}
                  data-ocid={`dashboard.recent_orders.item.${idx + 1}`}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
                >
                  <div>
                    <span className="font-medium font-body">
                      {order.billNumber}
                    </span>
                    {order.customerName && (
                      <span className="text-muted-foreground ml-2 font-body">
                        · {order.customerName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-body">
                      {order.paymentMethod}
                    </Badge>
                    <span
                      className="font-semibold font-body"
                      style={{ color: "#0F5132" }}
                    >
                      {formatINR(order.total)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── BillingScreen ─────────────────────────────────────────────────────────────

function BillingScreen({
  menuItems,
  cart,
  activeCategory,
  customerName,
  customerMobile,
  subtotal,
  gstAmount,
  total,
  gstEnabled,
  gstPct,
  onAddToCart,
  onUpdateQty,
  onRemoveFromCart,
  onClearCart,
  onSetCategory,
  onSetCustomerName,
  onSetCustomerMobile,
  onProceedToPayment,
  onBack,
}: {
  menuItems: MenuItem[];
  cart: OrderItem[];
  activeCategory: "All" | Category;
  customerName: string;
  customerMobile: string;
  subtotal: number;
  gstAmount: number;
  total: number;
  gstEnabled: boolean;
  gstPct: number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onSetCategory: (c: "All" | Category) => void;
  onSetCustomerName: (v: string) => void;
  onSetCustomerMobile: (v: string) => void;
  onProceedToPayment: () => void;
  onBack: () => void;
}) {
  const filtered =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((m) => m.category === activeCategory);

  const totalItems = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto p-0 md:p-4 md:grid md:grid-cols-[1fr_360px] md:gap-4 min-h-[calc(100vh-120px)]">
      {/* Left: Menu */}
      <div className="flex flex-col">
        {/* Back button row */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-border">
          <button
            type="button"
            data-ocid="billing.back_button"
            onClick={onBack}
            className="flex items-center gap-1.5 h-10 px-3 rounded-xl hover:bg-secondary transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        {/* Category tabs */}
        <div
          className="flex overflow-x-auto gap-2 px-4 py-3 bg-white border-b border-border no-scrollbar"
          data-ocid="billing.category_tab"
        >
          {(["All", ...CATEGORIES] as const).map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => onSetCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {cat !== "All" && CATEGORY_EMOJIS[cat as Category]} {cat}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
          {filtered.length === 0 ? (
            <div
              className="col-span-full text-center py-12 text-muted-foreground"
              data-ocid="billing.empty_state"
            >
              <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No items in this category</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const inCart = cart.find((ci) => ci.menuItemId === item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  data-ocid={`billing.menu_item.${idx + 1}`}
                  onClick={() => onAddToCart(item)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                    inCart
                      ? "border-primary bg-primary/5"
                      : "border-border bg-white hover:border-primary/50"
                  } shadow-xs`}
                >
                  {inCart && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {inCart.quantity}
                    </span>
                  )}
                  {item.imageUrl ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                      <UtensilsCrossed className="h-6 w-6 text-muted-foreground opacity-40" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-center text-foreground leading-tight">
                    {item.name}
                  </span>
                  <span className="text-primary font-bold text-sm">
                    {formatINR(item.price)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Order Summary */}
      <div
        className="bg-white border-t md:border-t-0 md:border-l border-border flex flex-col"
        data-ocid="billing.cart_panel"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Order Summary
            {totalItems > 0 && (
              <Badge className="bg-primary text-white text-xs">
                {totalItems}
              </Badge>
            )}
          </h3>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[40vh] md:max-h-none">
          {cart.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-8 text-muted-foreground"
              data-ocid="cart.empty_state"
            >
              <ShoppingCart className="h-8 w-8 opacity-30 mb-2" />
              <p className="text-sm">Add items to order</p>
            </div>
          ) : (
            cart.map((ci) => (
              <div key={ci.menuItemId} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ci.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatINR(ci.price)} each
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary"
                    onClick={() => onUpdateQty(ci.menuItemId, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">
                    {ci.quantity}
                  </span>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary"
                    onClick={() => onUpdateQty(ci.menuItemId, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 ml-1"
                    onClick={() => onRemoveFromCart(ci.menuItemId)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm font-bold text-primary w-14 text-right">
                  {formatINR(ci.price * ci.quantity)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Customer info */}
        <div className="px-4 py-3 border-t border-border space-y-2">
          <Input
            placeholder="Customer Name (optional)"
            value={customerName}
            onChange={(e) => onSetCustomerName(e.target.value)}
            className="h-9 text-sm"
            data-ocid="billing.customer_input"
          />
          <Input
            placeholder="Mobile Number (optional)"
            value={customerMobile}
            onChange={(e) => onSetCustomerMobile(e.target.value)}
            className="h-9 text-sm"
            inputMode="tel"
          />
        </div>

        {/* Totals */}
        <div className="px-4 py-3 border-t border-border space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          {gstEnabled && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST ({gstPct}%)</span>
              <span>{formatINR(gstAmount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-primary">{formatINR(total)}</span>
          </div>
        </div>

        {/* Proceed button */}
        <div className="px-4 pb-4">
          <Button
            data-ocid="billing.payment_button"
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl"
            disabled={cart.length === 0}
            onClick={onProceedToPayment}
          >
            Proceed to Payment →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── PaymentScreen ─────────────────────────────────────────────────────────────

function PaymentScreen({
  total,
  paymentMethod,
  cashReceived,
  onSetMethod,
  onSetCashReceived,
  onComplete,
  onBack,
}: {
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived: string;
  onSetMethod: (m: PaymentMethod) => void;
  onSetCashReceived: (v: string) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const change =
    paymentMethod === "Cash" && cashReceived
      ? Number.parseFloat(cashReceived) - total
      : null;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-display text-xl font-bold">Payment</h2>
      </div>

      {/* Amount */}
      <div className="bg-primary rounded-2xl p-6 text-center text-primary-foreground">
        <p className="text-sm opacity-80 mb-1">Total Amount</p>
        <p className="font-display text-4xl font-bold">{formatINR(total)}</p>
      </div>

      {/* Payment method */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">
          Payment Method
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {(["Cash", "UPI", "Card"] as PaymentMethod[]).map((method) => (
            <button
              type="button"
              key={method}
              data-ocid={`payment.${method.toLowerCase()}_button`}
              onClick={() => onSetMethod(method)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all min-h-[80px] ${
                paymentMethod === method
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white hover:border-primary/50"
              }`}
            >
              <span className="text-2xl">
                {method === "Cash" ? "💵" : method === "UPI" ? "📱" : "💳"}
              </span>
              <span className="text-sm font-semibold">{method}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cash change calc */}
      {paymentMethod === "Cash" && (
        <div className="space-y-3">
          <div>
            <Label className="text-sm mb-1.5 block">Amount Received (₹)</Label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder={`Min ${total.toFixed(2)}`}
              value={cashReceived}
              onChange={(e) => onSetCashReceived(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          {change !== null && (
            <div
              className={`p-3 rounded-xl text-center ${change >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              <p className="text-sm font-medium">
                {change >= 0
                  ? `Change to return: ${formatINR(change)}`
                  : `Insufficient amount by ${formatINR(Math.abs(change))}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Complete button */}
      <Button
        data-ocid="payment.complete_button"
        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl"
        disabled={
          paymentMethod === "Cash" &&
          (!cashReceived || Number.parseFloat(cashReceived) < total)
        }
        onClick={onComplete}
      >
        <Check className="h-5 w-5 mr-2" />
        Complete Payment
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2"
      >
        ← Back to Billing
      </button>
    </div>
  );
}

// ── BillPreviewScreen ─────────────────────────────────────────────────────────

function BillPreviewScreen({
  order,
  branch,
  gstSettings,
  role,
  onNewOrder,
  onDashboard,
}: {
  order: Order;
  branch: { name: string; short: string };
  gstSettings: GSTSettings;
  role: Role;
  onNewOrder: () => void;
  onDashboard: () => void;
}) {
  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Bill Preview</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="gap-1"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Receipt */}
      <div
        id="bill-print-area"
        className="bg-white rounded-2xl shadow-card border border-border p-5 font-mono text-sm"
      >
        {/* Header */}
        <div className="text-center mb-3">
          <p className="font-display text-lg font-bold text-foreground">
            Gobinath Hotel
          </p>
          <p className="text-xs text-muted-foreground">{branch.name}</p>
          {gstSettings.enabled && gstSettings.gstNumber && (
            <p className="text-xs text-muted-foreground">
              GSTIN: {gstSettings.gstNumber}
            </p>
          )}
          <Separator className="my-2" />
        </div>

        {/* Bill info */}
        <div className="text-xs mb-3 space-y-0.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bill No:</span>
            <span className="font-semibold">{order.billNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          {order.customerName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span>{order.customerName}</span>
            </div>
          )}
          {order.customerMobile && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mobile:</span>
              <span>{order.customerMobile}</span>
            </div>
          )}
        </div>

        <Separator className="my-2" />

        {/* Items */}
        <div className="space-y-1.5 mb-3">
          <div className="flex text-xs font-semibold text-muted-foreground">
            <span className="flex-1">Item</span>
            <span className="w-8 text-center">Qty</span>
            <span className="w-16 text-right">Rate</span>
            <span className="w-16 text-right">Amt</span>
          </div>
          <Separator className="my-1" />
          {order.items.map((item) => (
            <div key={item.menuItemId} className="flex text-xs">
              <span className="flex-1 truncate">{item.name}</span>
              <span className="w-8 text-center">{item.quantity}</span>
              <span className="w-16 text-right">{formatINR(item.price)}</span>
              <span className="w-16 text-right">
                {formatINR(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-2" />

        {/* Totals */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.gstAmount > 0 && (
            <div className="flex justify-between">
              <span>GST ({gstSettings.percentage}%)</span>
              <span>{formatINR(order.gstAmount)}</span>
            </div>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL</span>
            <span>{formatINR(order.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment</span>
            <span>{order.paymentMethod}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs text-muted-foreground">
          <p>Thank you for dining with us!</p>
          <p>Please visit again 😊</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-12 rounded-xl"
          onClick={onNewOrder}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          New Order
        </Button>
        {role === "owner" && (
          <Button className="h-12 rounded-xl bg-primary" onClick={onDashboard}>
            Dashboard
          </Button>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}

// ── MenuScreen ────────────────────────────────────────────────────────────────

function MenuScreen({
  menuItems,
  branchId,
  onUpdate,
  allItems,
  onBack,
}: {
  menuItems: MenuItem[];
  branchId: number;
  onUpdate: (items: MenuItem[]) => void;
  allItems: MenuItem[];
  onBack: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<"All" | Category>("All");

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Breakfast" as Category,
    imageUrl: "",
    available: true,
  });
  const [imageError, setImageError] = useState("");

  const openAdd = useCallback(() => {
    setEditItem(null);
    setForm({
      name: "",
      price: "",
      category: "Breakfast",
      imageUrl: "",
      available: true,
    });
    setImageError("");
    setShowModal(true);
  }, []);

  const openEdit = useCallback((item: MenuItem) => {
    setEditItem(item);
    setForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
      imageUrl: item.imageUrl ?? "",
      available: item.available,
    });
    setImageError("");
    setShowModal(true);
  }, []);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Only jpg, jpeg, png, webp files are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image size must be less than 2MB.");
      e.target.value = "";
      return;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, imageUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSave() {
    if (!form.name.trim() || !form.price) return;
    if (editItem) {
      onUpdate(
        allItems.map((i) =>
          i.id === editItem.id
            ? {
                ...i,
                name: form.name,
                price: Number.parseFloat(form.price),
                category: form.category,
                imageUrl: form.imageUrl,
                available: form.available,
              }
            : i,
        ),
      );
      toast.success("Item updated");
    } else {
      const newItem: MenuItem = {
        id: generateId(),
        branchId,
        name: form.name,
        price: Number.parseFloat(form.price),
        category: form.category,
        imageUrl: form.imageUrl,
        available: form.available,
      };
      onUpdate([...allItems, newItem]);
      toast.success("Item added");
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    onUpdate(allItems.filter((i) => i.id !== id));
    toast.success("Item deleted");
    setDeleteTarget(null);
  }

  function toggleAvailability(id: string) {
    onUpdate(
      allItems.map((i) =>
        i.id === id ? { ...i, available: !i.available } : i,
      ),
    );
  }

  const filtered =
    filterCat === "All"
      ? menuItems
      : menuItems.filter((m) => m.category === filterCat);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="menu.back_button"
            onClick={onBack}
            className="flex items-center gap-1.5 h-10 px-3 rounded-xl hover:bg-secondary transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h2 className="font-display text-xl font-bold">Menu Management</h2>
        </div>
        <Button
          data-ocid="menu.add_button"
          onClick={openAdd}
          className="h-10 bg-primary hover:bg-primary/90 rounded-xl gap-1"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex overflow-x-auto gap-2 no-scrollbar">
        {(["All", ...CATEGORIES] as const).map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterCat === cat
                ? "bg-primary text-white"
                : "bg-secondary text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items list */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="menu.empty_state"
        >
          <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No items yet. Add your first menu item!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              data-ocid={`menu.item.${idx + 1}`}
              className="bg-white rounded-xl border border-border p-3 flex items-center gap-3 shadow-xs"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F8F5F0] flex items-center justify-center flex-shrink-0 border border-border">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UtensilsCrossed className="h-5 w-5 text-muted-foreground opacity-50" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs py-0">
                    {item.category}
                  </Badge>
                  <span className="text-primary font-bold text-sm">
                    {formatINR(item.price)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.available}
                  onCheckedChange={() => toggleAvailability(item.id)}
                  className="data-[state=checked]:bg-primary"
                />
                <button
                  type="button"
                  data-ocid={`menu.edit_button.${idx + 1}`}
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  data-ocid={`menu.delete_button.${idx + 1}`}
                  onClick={() => setDeleteTarget(item.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm rounded-2xl bg-[#F8F5F0] shadow-xl p-0 overflow-hidden">
          {/* Dialog Header */}
          <div className="bg-[#0F5132] px-5 py-4">
            <DialogTitle className="font-display text-white text-lg font-bold tracking-wide">
              {editItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
            <p className="text-white/70 text-xs mt-0.5 font-body">
              Fill in the details below
            </p>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Item Name */}
            <div>
              <Label className="text-xs font-semibold text-[#0F5132] uppercase tracking-wide font-body">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Masala Dosa"
                className="mt-1.5 rounded-xl border-border/60 bg-white shadow-sm focus-visible:ring-[#0F5132] focus-visible:ring-2 h-11 font-body"
                data-ocid="menu.item_name.input"
              />
            </div>

            {/* Price + Category row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-[#0F5132] uppercase tracking-wide font-body">
                  Price (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="0.00"
                  className="mt-1.5 rounded-xl border-border/60 bg-white shadow-sm focus-visible:ring-[#0F5132] focus-visible:ring-2 h-11 font-body"
                  data-ocid="menu.item_price.input"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-[#0F5132] uppercase tracking-wide font-body">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as Category }))
                  }
                >
                  <SelectTrigger
                    className="mt-1.5 rounded-xl border-border/60 bg-white shadow-sm focus-visible:ring-[#0F5132] h-11 font-body"
                    data-ocid="menu.category.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Food Image Upload */}
            <div>
              <Label className="text-xs font-semibold text-[#0F5132] uppercase tracking-wide font-body">
                Food Image
              </Label>
              <div className="mt-1.5">
                {form.imageUrl ? (
                  /* Image preview card */
                  <div className="relative rounded-xl overflow-hidden border border-border/60 bg-white shadow-sm">
                    <img
                      src={form.imageUrl}
                      alt="Food preview"
                      className="w-full h-36 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors"
                      data-ocid="menu.remove_image.button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Upload button */
                  <label
                    className="flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl border-2 border-dashed border-[#FF7A00]/50 bg-white cursor-pointer hover:bg-[#FF7A00]/5 transition-colors"
                    data-ocid="menu.upload_button"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF7A00]/10">
                      <ImageIcon className="h-5 w-5 text-[#FF7A00]" />
                    </div>
                    <span className="text-xs font-medium text-[#FF7A00] font-body">
                      Upload Food Image
                    </span>
                    <span className="text-[10px] text-muted-foreground font-body">
                      JPG, PNG, WebP — max 2MB
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
                {imageError && (
                  <p className="text-xs text-red-500 mt-1.5 font-body">
                    {imageError}
                  </p>
                )}
              </div>
            </div>

            {/* Available toggle */}
            <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-border/60 shadow-sm">
              <Switch
                id="available"
                checked={form.available}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, available: v }))
                }
                className="data-[state=checked]:bg-[#0F5132]"
              />
              <div>
                <Label
                  htmlFor="available"
                  className="text-sm font-semibold cursor-pointer font-body text-[#0F5132]"
                >
                  Available
                </Label>
                <p className="text-[10px] text-muted-foreground font-body">
                  Show this item on the billing screen
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 px-5 pb-5 pt-0">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="flex-1 rounded-xl h-11 border-[#0F5132]/30 text-[#0F5132] font-body"
              data-ocid="menu.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.price}
              className="flex-1 rounded-xl h-11 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white font-body"
              data-ocid="menu.save_button"
            >
              {editItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="menu.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              data-ocid="menu.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── ReportsScreen ─────────────────────────────────────────────────────────────

function ReportsScreen({
  orders,
  onBack,
}: { orders: Order[]; onBack: () => void }) {
  const today = new Date();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));

  const filteredOrders = useMemo(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime() + 86400000;
    return orders.filter((o) => o.createdAt >= start && o.createdAt < end);
  }, [orders, startDate, endDate]);

  const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
  const avgOrder =
    filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  // Daily sales data
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      map[key] = 0;
    }
    for (const o of filteredOrders) {
      const key = new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      if (key in map) map[key] += o.total;
    }
    return Object.entries(map).map(([date, sales]) => ({
      date,
      sales: Math.round(sales),
    }));
  }, [filteredOrders, startDate, endDate]);

  // Payment method breakdown
  const paymentData = useMemo(() => {
    const counts = { Cash: 0, UPI: 0, Card: 0 };
    for (const o of filteredOrders) {
      counts[o.paymentMethod] += o.total;
    }
    return [
      { name: "Cash", value: Math.round(counts.Cash), color: "#1B4332" },
      { name: "UPI", value: Math.round(counts.UPI), color: "#FF7F11" },
      { name: "Card", value: Math.round(counts.Card), color: "#4A90D9" },
    ].filter((d) => d.value > 0);
  }, [filteredOrders]);

  // Branch comparison
  const branchData = useMemo(() => {
    const b1 = orders
      .filter((o) => o.branchId === 1)
      .reduce((s, o) => s + o.total, 0);
    const b2 = orders
      .filter((o) => o.branchId === 2)
      .reduce((s, o) => s + o.total, 0);
    return [
      { branch: "Sethurapatti", sales: Math.round(b1) },
      { branch: "JJ College", sales: Math.round(b2) },
    ];
  }, [orders]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="reports.back_button"
          onClick={onBack}
          className="flex items-center gap-1.5 h-10 px-3 rounded-xl hover:bg-secondary transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="font-display text-xl font-bold">Reports</h2>
      </div>

      {/* Date range */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-xs">
        <p className="text-sm font-semibold mb-3">Date Range</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 h-10"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-card text-center border border-border">
          <p className="text-lg font-bold text-primary">
            {formatINR(totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Revenue</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card text-center border border-border">
          <p className="text-lg font-bold text-accent">
            {filteredOrders.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Orders</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card text-center border border-border">
          <p className="text-lg font-bold text-foreground">
            {formatINR(avgOrder)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Avg Order</p>
        </div>
      </div>

      {/* Daily sales chart */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-xs">
        <p className="text-sm font-semibold mb-3">Daily Sales (₹)</p>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={dailyData}
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v) => [`₹${v}`, "Sales"]} />
              <Bar
                dataKey="sales"
                fill="oklch(0.35 0.09 151)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="reports.empty_state"
          >
            No data for selected range
          </div>
        )}
      </div>

      {/* Payment method */}
      {paymentData.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-4 shadow-xs">
          <p className="text-sm font-semibold mb-3">Payment Methods</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={150}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`₹${v}`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {paymentData.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ background: d.color }}
                    />
                    <span>{d.name}</span>
                  </div>
                  <span className="font-semibold">₹{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Branch comparison */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-xs">
        <p className="text-sm font-semibold mb-3">
          Branch Comparison (All Time)
        </p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart
            data={branchData}
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
            <Tooltip formatter={(v) => [`₹${v}`, "Sales"]} />
            <Bar
              dataKey="sales"
              fill="oklch(0.72 0.18 52)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── EmployeesScreen ───────────────────────────────────────────────────────────

function EmployeesScreen({
  employees,
  branchId,
  onUpdate,
  allEmployees,
  onBack,
}: {
  employees: Employee[];
  branchId: number;
  onUpdate: (e: Employee[]) => void;
  allEmployees: Employee[];
  onBack: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    salary: "",
    salaryPaid: false,
  });

  function openAdd() {
    setEditEmp(null);
    setForm({ name: "", role: "", salary: "", salaryPaid: false });
    setShowModal(true);
  }

  function openEdit(emp: Employee) {
    setEditEmp(emp);
    setForm({
      name: emp.name,
      role: emp.role,
      salary: String(emp.salary),
      salaryPaid: emp.salaryPaid,
    });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.role.trim() || !form.salary) return;
    if (editEmp) {
      onUpdate(
        allEmployees.map((e) =>
          e.id === editEmp.id
            ? {
                ...e,
                name: form.name,
                role: form.role,
                salary: Number.parseFloat(form.salary),
                salaryPaid: form.salaryPaid,
              }
            : e,
        ),
      );
      toast.success("Employee updated");
    } else {
      const newEmp: Employee = {
        id: generateId(),
        branchId,
        name: form.name,
        role: form.role,
        salary: Number.parseFloat(form.salary),
        salaryPaid: form.salaryPaid,
      };
      onUpdate([...allEmployees, newEmp]);
      toast.success("Employee added");
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    onUpdate(allEmployees.filter((e) => e.id !== id));
    toast.success("Employee removed");
    setDeleteTarget(null);
  }

  function toggleSalaryPaid(id: string) {
    onUpdate(
      allEmployees.map((e) =>
        e.id === id ? { ...e, salaryPaid: !e.salaryPaid } : e,
      ),
    );
  }

  const branchEmployees = employees.filter((e) => e.branchId === branchId);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="employee.back_button"
            onClick={onBack}
            className="flex items-center gap-1.5 h-10 px-3 rounded-xl hover:bg-secondary transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h2 className="font-display text-xl font-bold">Employees</h2>
        </div>
        <Button
          data-ocid="employee.add_button"
          onClick={openAdd}
          className="h-10 bg-primary hover:bg-primary/90 rounded-xl gap-1"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {branchEmployees.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="employee.empty_state"
        >
          <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No employees added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {branchEmployees.map((emp, idx) => (
            <div
              key={emp.id}
              data-ocid={`employee.item.${idx + 1}`}
              className="bg-white rounded-xl border border-border p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    data-ocid={`employee.edit_button.${idx + 1}`}
                    onClick={() => openEdit(emp)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    data-ocid={`employee.delete_button.${idx + 1}`}
                    onClick={() => setDeleteTarget(emp.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Salary:{" "}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {formatINR(emp.salary)}/month
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Paid</span>
                  <Switch
                    checked={emp.salaryPaid}
                    onCheckedChange={() => toggleSalaryPaid(emp.id)}
                    className="data-[state=checked]:bg-green-600"
                    data-ocid={`employee.switch.${idx + 1}`}
                  />
                  <Badge
                    variant={emp.salaryPaid ? "default" : "outline"}
                    className={`text-xs ${emp.salaryPaid ? "bg-green-600" : "text-orange-600 border-orange-300"}`}
                  >
                    {emp.salaryPaid ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editEmp ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-sm">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Employee name"
                className="mt-1"
                data-ocid="employee.name.input"
              />
            </div>
            <div>
              <Label className="text-sm">Role *</Label>
              <Input
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
                placeholder="e.g. Waiter, Cook"
                className="mt-1"
                data-ocid="employee.role.input"
              />
            </div>
            <div>
              <Label className="text-sm">Salary (₹) *</Label>
              <Input
                type="number"
                value={form.salary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, salary: e.target.value }))
                }
                placeholder="Monthly salary"
                className="mt-1"
                data-ocid="employee.salary.input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="salary-paid"
                checked={form.salaryPaid}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, salaryPaid: v }))
                }
                className="data-[state=checked]:bg-green-600"
              />
              <Label htmlFor="salary-paid" className="text-sm cursor-pointer">
                Salary Paid
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="employee.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.role.trim() || !form.salary}
              className="bg-primary"
              data-ocid="employee.save_button"
            >
              {editEmp ? "Save Changes" : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="employee.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              data-ocid="employee.confirm_button"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── GSTSettingsScreen ─────────────────────────────────────────────────────────

function GSTSettingsScreen({
  gstSettings,
  branchId,
  onUpdate,
  onBack,
}: {
  gstSettings: GSTSettings[];
  branchId: number;
  onUpdate: (settings: GSTSettings[]) => void;
  onBack: () => void;
}) {
  const current = gstSettings.find((g) => g.branchId === branchId) ?? {
    branchId,
    enabled: false,
    gstNumber: "",
    percentage: 5,
  };

  const [form, setForm] = useState({
    enabled: current.enabled,
    gstNumber: current.gstNumber,
    percentage: String(current.percentage),
  });

  function handleSave() {
    const updated = gstSettings.some((g) => g.branchId === branchId)
      ? gstSettings.map((g) =>
          g.branchId === branchId
            ? {
                ...g,
                enabled: form.enabled,
                gstNumber: form.gstNumber,
                percentage: Number.parseFloat(form.percentage) || 5,
              }
            : g,
        )
      : [
          ...gstSettings,
          {
            branchId,
            enabled: form.enabled,
            gstNumber: form.gstNumber,
            percentage: Number.parseFloat(form.percentage) || 5,
          },
        ];
    onUpdate(updated);
    toast.success("GST settings saved!");
  }

  const branch = BRANCHES.find((b) => b.id === branchId);

  return (
    <div className="max-w-md mx-auto p-4 space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="settings.back_button"
          onClick={onBack}
          className="flex items-center gap-1.5 h-10 px-3 rounded-xl hover:bg-secondary transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="font-display text-xl font-bold">GST Settings</h2>
      </div>
      <p className="text-sm text-muted-foreground">{branch?.name}</p>

      <div className="bg-white rounded-2xl border border-border p-5 shadow-xs space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Enable GST</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Apply GST on bills for this branch
            </p>
          </div>
          <Switch
            data-ocid="settings.gst_toggle"
            checked={form.enabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <Separator />

        {/* GST Number */}
        <div>
          <Label className="text-sm font-medium">GST Number (GSTIN)</Label>
          <Input
            value={form.gstNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, gstNumber: e.target.value }))
            }
            placeholder="e.g. 33XXXXX1234X1ZX"
            className="mt-1.5"
            disabled={!form.enabled}
            data-ocid="settings.gst_number.input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your 15-digit GST Identification Number
          </p>
        </div>

        {/* GST Percentage */}
        <div>
          <Label className="text-sm font-medium">GST Rate (%)</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={form.percentage}
            onChange={(e) =>
              setForm((f) => ({ ...f, percentage: e.target.value }))
            }
            placeholder="5"
            className="mt-1.5 max-w-[120px]"
            disabled={!form.enabled}
            min={0}
            max={28}
            data-ocid="settings.gst_percentage.input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Common rates: 5%, 12%, 18%, 28%
          </p>
        </div>

        {/* Preview */}
        {form.enabled && (
          <div className="bg-secondary rounded-xl p-3 text-sm space-y-1">
            <p className="font-medium text-foreground">Preview (₹100 order)</p>
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹100.00</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST ({form.percentage}%)</span>
              <span>
                ₹{(Number.parseFloat(form.percentage) || 0).toFixed(2)}
              </span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>
                ₹{(100 + (Number.parseFloat(form.percentage) || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      <Button
        data-ocid="settings.save_button"
        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl"
        onClick={handleSave}
      >
        <Check className="h-5 w-5 mr-2" />
        Save Settings
      </Button>
    </div>
  );
}
