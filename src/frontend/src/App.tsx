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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Banknote,
  BarChart2,
  BarChart3,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Edit3,
  History,
  ImageIcon,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  Minus,
  Moon,
  Package,
  Phone,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Sun,
  Trash2,
  TrendingUp,
  UserCog,
  Users,
  UtensilsCrossed,
  Wallet,
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
import { QRCodeSVG } from "./components/QRCodeSVG";

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
  | "settings"
  | "money-management";

type Category = "Breakfast" | "Lunch" | "Dinner" | "Beverages" | "Snacks";
type PaymentMethod = "Cash" | "QR";
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

interface AdvanceRecord {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  reason: string;
  createdAt: number;
}

interface Employee {
  id: string;
  branchId: number;
  employeeId: string; // auto-generated: EMP-001, EMP-002, ...
  name: string;
  mobile: string;
  address: string;
  role: string;
  salaryType: "Monthly" | "Daily";
  salary: number;
  salaryPaid: boolean;
  advances: AdvanceRecord[];
  dateOfJoin: string; // YYYY-MM-DD
}

interface SalaryPayment {
  id: string;
  employeeId: string;
  type: "Salary" | "Advance";
  salaryType: "Monthly" | "Daily";
  month?: string; // e.g. "March 2026" - for Monthly
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMode: "Cash" | "Online";
  notes?: string;
  createdAt: number;
}

interface GSTSettings {
  branchId: number;
  enabled: boolean;
  gstNumber: string;
  percentage: number;
}

interface UpiSettings {
  branchId: number;
  upiId: string;
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

const _CATEGORY_EMOJIS: Record<Category, string> = {
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

function generateEmployeeId(allEmployees: Employee[]): string {
  const maxNum = allEmployees.reduce((max, e) => {
    const match = e.employeeId?.match(/EMP-(\d+)/);
    return match ? Math.max(max, Number.parseInt(match[1], 10)) : max;
  }, 0);
  return `EMP-${String(maxNum + 1).padStart(3, "0")}`;
}

function generateBillNumber(branchId: number): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `pos_bill_counter_${branchId}_${today}`;
  const current = Number.parseInt(localStorage.getItem(key) ?? "0", 10);
  const next = current + 1;
  localStorage.setItem(key, String(next));
  const prefix = branchId === 1 ? "GSS" : "GJJ";
  return `${prefix}-${String(next).padStart(4, "0")}`;
}

function formatINR(amount: number): string {
  return `₹${amount.toFixed(2)}`;
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
        employeeId: "EMP-001",
        name: "Ramu",
        mobile: "9876543210",
        address: "Sethurapatti, Tamil Nadu",
        role: "Waiter",
        salaryType: "Monthly",
        salary: 8000,
        salaryPaid: true,
        advances: [],
        dateOfJoin: "2025-01-01",
      },
      {
        id: generateId(),
        branchId: 1,
        employeeId: "EMP-002",
        name: "Selvam",
        mobile: "9876543211",
        address: "Sethurapatti, Tamil Nadu",
        role: "Cook",
        salaryType: "Monthly",
        salary: 12000,
        salaryPaid: false,
        advances: [
          {
            id: generateId(),
            amount: 2000,
            date: "2026-03-08",
            reason: "Emergency",
            createdAt: Date.now(),
          },
        ],
        dateOfJoin: "2025-01-01",
      },
      {
        id: generateId(),
        branchId: 2,
        employeeId: "EMP-003",
        name: "Kannan",
        mobile: "9876543212",
        address: "JJ College Area, Tamil Nadu",
        role: "Waiter",
        salaryType: "Monthly",
        salary: 8000,
        salaryPaid: true,
        advances: [],
        dateOfJoin: "2025-01-01",
      },
      {
        id: generateId(),
        branchId: 2,
        employeeId: "EMP-004",
        name: "Mani",
        mobile: "9876543213",
        address: "JJ College Area, Tamil Nadu",
        role: "Cashier",
        salaryType: "Monthly",
        salary: 10000,
        salaryPaid: true,
        advances: [],
        dateOfJoin: "2025-01-01",
      },
    ];
    lsSet("pos_employees", employees);
  }
  if (!localStorage.getItem("pos_salary_payments")) {
    lsSet("pos_salary_payments", []);
  }
  if (!localStorage.getItem("pos_gst_settings")) {
    const gst: GSTSettings[] = [
      { branchId: 1, enabled: false, gstNumber: "", percentage: 5 },
      { branchId: 2, enabled: false, gstNumber: "", percentage: 5 },
    ];
    lsSet("pos_gst_settings", gst);
  }
  if (!localStorage.getItem("pos_upi_settings")) {
    const upi: UpiSettings[] = [
      { branchId: 1, upiId: "" },
      { branchId: 2, upiId: "" },
    ];
    lsSet("pos_upi_settings", upi);
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
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const raw = lsGet<Employee[]>("pos_employees", []);
    return raw.map((e, i) => ({
      ...e,
      employeeId: e.employeeId ?? `EMP-${String(i + 1).padStart(3, "0")}`,
      mobile: e.mobile ?? "",
      address: e.address ?? "",
      salaryType: (e.salaryType ?? "Monthly") as Employee["salaryType"],
      advances: e.advances ?? [],
      dateOfJoin: e.dateOfJoin ?? "2025-01-01",
    }));
  });
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(() =>
    lsGet<SalaryPayment[]>("pos_salary_payments", []),
  );
  const [gstSettings, setGstSettings] = useState<GSTSettings[]>(() =>
    lsGet<GSTSettings[]>("pos_gst_settings", [
      { branchId: 1, enabled: false, gstNumber: "", percentage: 5 },
      { branchId: 2, enabled: false, gstNumber: "", percentage: 5 },
    ]),
  );
  const [upiSettings, setUpiSettings] = useState<UpiSettings[]>(() =>
    lsGet<UpiSettings[]>("pos_upi_settings", [
      { branchId: 1, upiId: "" },
      { branchId: 2, upiId: "" },
    ]),
  );

  // Cart state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [activeCategory, setActiveCategory] = useState<"All" | Category>("All");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cashReceived, setCashReceived] = useState<string>("");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // isDark = false → dark theme (default, no class); isDark = true → light theme (.light class)
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

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
    lsSet("pos_salary_payments", salaryPayments);
  }, [salaryPayments]);
  useEffect(() => {
    lsSet("pos_gst_settings", gstSettings);
  }, [gstSettings]);
  useEffect(() => {
    lsSet("pos_upi_settings", upiSettings);
  }, [upiSettings]);

  const activeBranchObj = BRANCHES.find((b) => b.id === activeBranch)!;
  const activeGST = gstSettings.find((g) => g.branchId === activeBranch) ?? {
    branchId: activeBranch,
    enabled: false,
    gstNumber: "",
    percentage: 5,
  };
  const activeUpi = upiSettings.find((u) => u.branchId === activeBranch) ?? {
    branchId: activeBranch,
    upiId: "",
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
      billNumber: generateBillNumber(activeBranch),
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
    setPaymentSuccess(true);
  }

  function handlePrintBill() {
    setPaymentSuccess(false);
    setScreen("bill-preview");
  }

  function startNewOrder() {
    clearCart();
    setCurrentOrder(null);
    setCashReceived("");
    setPaymentMethod("Cash");
    setPaymentSuccess(false);
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
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          screen: "dashboard" as Screen,
        },
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
          id: "money-management",
          label: "Money Management",
          icon: Wallet,
          screen: "money-management" as Screen,
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
    "payment",
    "bill-preview",
    "menu",
    "reports",
    "employees",
    "settings",
    "money-management",
  ].includes(screen);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Toaster position="top-center" richColors />

      {/* Pre-auth screens: no shell */}
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

      {/* Authenticated screens: wrapped in AppShell */}
      {showNav && (
        <AppShell
          role={role}
          branch={activeBranchObj}
          screen={screen}
          isDark={isDark}
          sidebarOpen={sidebarOpen}
          onToggleDark={() => setIsDark((d) => !d)}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          onCloseSidebar={() => setSidebarOpen(false)}
          onNavigate={(s) => {
            setScreen(s);
            setSidebarOpen(false);
          }}
          onSwitchBranch={() => {
            setScreen("branch-select");
            setSidebarOpen(false);
          }}
          onLogout={handleLogout}
          navItems={navItems}
        >
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
              upiId={activeUpi.upiId}
              paymentSuccess={paymentSuccess}
              onSetMethod={setPaymentMethod}
              onSetCashReceived={setCashReceived}
              onComplete={completePayment}
              onPrintBill={handlePrintBill}
              onBackToBilling={startNewOrder}
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
            <SettingsScreen
              gstSettings={gstSettings}
              upiSettings={upiSettings}
              branchId={activeBranch}
              onUpdateGst={setGstSettings}
              onUpdateUpi={setUpiSettings}
              onBack={() => setScreen("dashboard")}
            />
          )}

          {screen === "money-management" && role === "owner" && (
            <MoneyManagementScreen
              employees={employees.filter((e) => e.branchId === activeBranch)}
              allEmployees={employees}
              salaryPayments={salaryPayments.filter((sp) => {
                const emp = employees.find((e) => e.id === sp.employeeId);
                return emp?.branchId === activeBranch;
              })}
              allSalaryPayments={salaryPayments}
              branchId={activeBranch}
              onUpdateEmployees={setEmployees}
              onUpdateSalaryPayments={setSalaryPayments}
              onBack={() => setScreen("dashboard")}
            />
          )}
        </AppShell>
      )}
    </div>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────

function AppShell({
  role,
  branch,
  screen,
  isDark,
  sidebarOpen,
  onToggleDark,
  onToggleSidebar,
  onCloseSidebar,
  onNavigate,
  onSwitchBranch,
  onLogout,
  navItems,
  children,
}: {
  role: Role;
  branch: { id: number; name: string; short: string };
  screen: Screen;
  isDark: boolean;
  sidebarOpen: boolean;
  onToggleDark: () => void;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
  onNavigate: (s: Screen) => void;
  onSwitchBranch: () => void;
  onLogout: () => void;
  navItems: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    screen: Screen;
  }[];
  children: React.ReactNode;
}) {
  const PAGE_TITLES: Partial<Record<Screen, string>> = {
    dashboard: "Dashboard",
    billing: "Billing",
    menu: "Menu Management",
    reports: "Reports",
    employees: "Employees",
    settings: "Settings",
    payment: "Payment",
    "bill-preview": "Bill Preview",
    "money-management": "Money Management",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCloseSidebar}
          onKeyDown={(e) => e.key === "Escape" && onCloseSidebar()}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col w-60 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
        data-ocid="sidebar.panel"
      >
        {/* Logo + Hotel name */}
        <div className="px-4 py-5 border-b border-sidebar-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-sidebar-foreground/20 flex-shrink-0 shadow-lg">
            <img
              src="/assets/uploads/modern-restaurant-logo-design-for-keeaap_FMTnl_lcRTG9KHviZ8Oxbw_iIsYXoF4R0OuTPt3-5QqLA_sd-1.jpeg"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-sm text-sidebar-foreground leading-tight truncate">
              Gobinath Hotel
            </p>
            <p className="text-[11px] leading-tight truncate text-sidebar-foreground/50">
              {role === "owner" ? branch.short : "Staff Mode"}
            </p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = screen === item.screen;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`sidebar.nav.${item.id}_link`}
                onClick={() => onNavigate(item.screen)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? "sidebar-item-active font-semibold"
                    : "hover:bg-sidebar-accent"
                }`}
              >
                <div
                  className={`sidebar-icon-wrap${isActive ? " active" : ""}`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors duration-200 ${
                      isActive
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/40 group-hover:text-sidebar-primary"
                    }`}
                  />
                </div>
                <span
                  className={`text-sm transition-colors duration-200 ${
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Branch switch (owner) + Theme toggle + Logout */}
        <div className="border-t border-sidebar-border px-2 py-3 space-y-0.5">
          {role === "owner" && (
            <button
              type="button"
              data-ocid="sidebar.switch_branch_button"
              onClick={onSwitchBranch}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-sidebar-accent group"
            >
              <div className="sidebar-icon-wrap">
                <MapPin className="h-4 w-4 text-sidebar-primary transition-colors" />
              </div>
              <span className="text-sm text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors">
                Switch Branch
              </span>
            </button>
          )}
          <button
            type="button"
            data-ocid="sidebar.theme_toggle"
            onClick={onToggleDark}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-sidebar-accent group"
          >
            <div className="sidebar-icon-wrap">
              {isDark ? (
                <Sun className="h-4 w-4 text-sidebar-primary transition-colors" />
              ) : (
                <Moon className="h-4 w-4 text-sidebar-primary transition-colors" />
              )}
            </div>
            <span className="text-sm text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
          <button
            type="button"
            data-ocid="sidebar.logout_button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-red-500/10 group"
          >
            <div
              className="sidebar-icon-wrap"
              style={{ background: "rgba(239,68,68,0.12)" }}
            >
              <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors" />
            </div>
            <span className="text-sm text-sidebar-foreground/60 group-hover:text-red-400 transition-colors">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ── Right side: mini-header + content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mini header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile only) */}
            <button
              type="button"
              data-ocid="topbar.hamburger_button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <MenuIcon className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="font-display font-bold text-lg text-foreground">
              {PAGE_TITLES[screen] ?? ""}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SidebarClock />
            <button
              type="button"
              data-ocid="topbar.theme_toggle"
              onClick={onToggleDark}
              className="hidden lg:flex p-2 rounded-xl hover:bg-secondary transition-colors text-primary hover:text-primary"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              data-ocid="topbar.logout_button"
              onClick={onLogout}
              className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
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
    <div
      className="text-right leading-tight hidden sm:block"
      data-ocid="topbar.datetime"
    >
      <p className="text-[11px] font-semibold text-foreground">{dateStr}</p>
      <p className="text-[11px] text-muted-foreground">{timeStr}</p>
    </div>
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
              className="group relative flex items-center gap-4 px-5 py-4 sm:py-5 rounded-2xl border border-border cursor-pointer transition-all duration-300 text-left w-full hover:border-primary/40"
              style={{
                background: "oklch(0.235 0.032 268 / 0.95)",
                boxShadow:
                  "0 4px 24px 0 rgba(0,0,0,0.30), 0 1px 4px 0 rgba(0,0,0,0.20)",
              }}
            >
              {/* Hover highlight overlay */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.705 0.185 42 / 0.06) 0%, oklch(0.730 0.175 45 / 0.03) 100%)",
                }}
              />

              {/* Icon circle */}
              <div className="relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/15 shadow-glow-orange">
                <Icon className="h-6 w-6 text-primary" />
              </div>

              {/* Branch name — bold and clear */}
              <p className="flex-1 font-display font-bold text-base sm:text-lg leading-snug truncate text-foreground">
                {branch.name}
              </p>

              {/* Arrow */}
              <ChevronRight className="flex-shrink-0 h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-primary transition-all duration-300" />
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
  iconBg: string;
  iconColor: string;
  screen: Screen;
  ocid: string;
  description: string;
}[] = [
  {
    label: "Billing",
    icon: Receipt,
    iconBg: "oklch(var(--primary) / 0.15)",
    iconColor: "oklch(var(--primary))",
    screen: "billing",
    ocid: "dashboard.billing.card",
    description: "New orders & bills",
  },
  {
    label: "Menu",
    icon: UtensilsCrossed,
    iconBg: "oklch(0.730 0.175 45 / 0.15)",
    iconColor: "oklch(0.730 0.175 45)",
    screen: "menu",
    ocid: "dashboard.menu.card",
    description: "Manage food items",
  },
  {
    label: "Reports",
    icon: BarChart3,
    iconBg: "oklch(0.52 0.09 210 / 0.18)",
    iconColor: "oklch(0.52 0.09 210)",
    screen: "reports",
    ocid: "dashboard.reports.card",
    description: "Sales analytics",
  },
  {
    label: "Employees",
    icon: Users,
    iconBg: "oklch(0.42 0.16 260 / 0.18)",
    iconColor: "oklch(0.42 0.16 260)",
    screen: "employees",
    ocid: "dashboard.employees.card",
    description: "Staff management",
  },
  {
    label: "Money Management",
    icon: Wallet,
    iconBg: "oklch(0.55 0.14 151 / 0.18)",
    iconColor: "oklch(0.55 0.14 151)",
    screen: "money-management",
    ocid: "dashboard.money_management.card",
    description: "Salary & advances",
  },
  {
    label: "Settings",
    icon: Settings,
    iconBg: "oklch(var(--muted-foreground) / 0.15)",
    iconColor: "oklch(var(--muted-foreground))",
    screen: "settings",
    ocid: "dashboard.settings.card",
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
      className="max-w-4xl mx-auto p-4 pb-6 space-y-5 bg-background"
    >
      {/* Branch subtitle */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm text-muted-foreground mb-1">{branch.name}</p>
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
          className="pos-card p-3 sm:p-4 text-center"
          data-ocid="dashboard.sales_card"
        >
          <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center bg-primary/15">
            <IndianRupee className="h-4 w-4 text-primary" />
          </div>
          <p className="text-base sm:text-lg font-bold leading-tight text-primary">
            {formatINR(todaySales)}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 font-body">
            Today Sales
          </p>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          variants={itemVariants}
          className="pos-card p-3 sm:p-4 text-center"
          data-ocid="dashboard.orders_card"
        >
          <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center bg-accent/15">
            <Package className="h-4 w-4 text-accent" />
          </div>
          <p className="text-base sm:text-lg font-bold leading-tight text-accent">
            {todayOrders.length}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 font-body">
            Total Orders
          </p>
        </motion.div>

        {/* Top Item */}
        <motion.div
          variants={itemVariants}
          className="pos-card p-3 sm:p-4 text-center"
          data-ocid="dashboard.topitem_card"
        >
          <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs sm:text-sm font-bold leading-tight truncate text-foreground">
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
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        data-ocid="dashboard.modules_section"
      >
        {MODULE_CONFIG.map((mod) => {
          const ModIcon = mod.icon;
          return (
            <motion.button
              type="button"
              key={mod.screen}
              data-ocid={mod.ocid}
              variants={itemVariants}
              whileHover={{
                y: -4,
                scale: 1.03,
                boxShadow:
                  "0 14px 40px 0 oklch(0.705 0.185 42 / 0.18), 0 4px 12px 0 rgba(0,0,0,0.25)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(mod.screen)}
              className="pos-card-hover flex flex-col items-center gap-3 p-4 sm:p-5 cursor-pointer min-h-[140px] sm:min-h-[155px] text-center"
            >
              {/* Icon container — soft circular background */}
              <div
                className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200"
                style={{
                  background: mod.iconBg,
                  boxShadow: `0 4px 18px 0 ${mod.iconBg.replace("/ 0.15", "/ 0.35").replace("/ 0.18", "/ 0.35")}`,
                }}
              >
                <ModIcon
                  className="w-8 h-8 sm:w-9 sm:h-9"
                  style={{ color: mod.iconColor }}
                />
              </div>
              {/* Label + Description */}
              <div className="flex flex-col items-center gap-0.5">
                <p className="font-display font-semibold text-sm sm:text-base leading-tight text-foreground">
                  {mod.label}
                </p>
                <p className="text-[11px] text-muted-foreground font-body leading-snug">
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
          className="pos-card p-4"
          data-ocid="dashboard.recent_orders_section"
        >
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 font-body text-primary">
            <Clock className="h-4 w-4 text-primary" />
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
                    <span className="font-semibold font-body text-primary">
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
  onBack: _onBack,
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
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      // When searching, ignore category filter and search across all items
      return menuItems.filter((m) => m.name.toLowerCase().includes(q));
    }
    return activeCategory === "All"
      ? menuItems
      : menuItems.filter((m) => m.category === activeCategory);
  })();

  const totalItems = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto p-0 md:p-4 md:grid md:grid-cols-[1fr_360px] md:gap-4 min-h-[calc(100vh-120px)]">
      {/* Left: Menu */}
      <div className="flex flex-col">
        {/* Category tabs */}
        <div
          className="flex overflow-x-auto gap-2 px-4 py-3 bg-card border-b border-border no-scrollbar"
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
              {cat}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="px-4 pt-3 pb-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food item..."
              data-ocid="billing.search_input"
              className="w-full pl-9 pr-4 py-2.5 rounded-full border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
          {filtered.length === 0 ? (
            <div
              className="col-span-full text-center py-12 text-muted-foreground"
              data-ocid="billing.items.empty_state"
            >
              <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>
                {searchQuery.trim()
                  ? "No items found"
                  : "No items in this category"}
              </p>
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
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                    inCart
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  } shadow-xs`}
                >
                  {inCart && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {inCart.quantity}
                    </span>
                  )}
                  {item.imageUrl ? (
                    <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 mx-auto">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 mx-auto">
                      <UtensilsCrossed className="h-10 w-10 text-muted-foreground opacity-40" />
                    </div>
                  )}
                  <span
                    className="text-sm font-bold text-center leading-tight"
                    style={{ color: "#000000" }}
                  >
                    {item.name}
                  </span>
                  <span
                    className="text-sm font-extrabold text-center"
                    style={{ color: "#000000" }}
                  >
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
        className="bg-card border-t md:border-t-0 md:border-l border-border flex flex-col"
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
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl glow-btn"
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
  upiId,
  paymentSuccess,
  onSetMethod,
  onSetCashReceived,
  onComplete,
  onPrintBill,
  onBackToBilling,
  onBack,
}: {
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived: string;
  upiId: string;
  paymentSuccess: boolean;
  onSetMethod: (m: PaymentMethod) => void;
  onSetCashReceived: (v: string) => void;
  onComplete: () => void;
  onPrintBill: () => void;
  onBackToBilling: () => void;
  onBack: () => void;
}) {
  const change =
    paymentMethod === "Cash" && cashReceived
      ? Number.parseFloat(cashReceived) - total
      : null;

  // UPI deep link for QR
  const upiDeepLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("Gobinath Hotel")}&am=${total.toFixed(2)}&cu=INR`
    : "";

  // ── Payment Success Screen ──────────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <div
        className="max-w-md mx-auto p-6 flex flex-col items-center justify-center min-h-[calc(100vh-160px)] gap-6"
        data-ocid="payment.success_state"
      >
        {/* Success icon — green circle with green tick */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle, #dcfce7 0%, #bbf7d0 60%, #86efac 100%)",
            boxShadow: "0 0 0 6px #dcfce7, 0 8px 32px 0 rgba(22,163,74,0.25)",
          }}
        >
          <Check
            className="h-14 w-14"
            style={{ color: "#16A34A", strokeWidth: 3 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center space-y-2"
        >
          <h2
            className="text-2xl font-bold font-display"
            style={{ color: "#16A34A" }}
          >
            Payment Successful
          </h2>
          <p className="text-muted-foreground text-sm font-body">
            {paymentMethod === "Cash"
              ? "Cash payment received"
              : "QR payment confirmed"}
          </p>
          <div
            className="inline-block px-5 py-2 rounded-xl mt-1"
            style={{ background: "#dcfce7", border: "1px solid #86efac" }}
          >
            <p className="font-bold text-xl" style={{ color: "#16A34A" }}>
              {formatINR(total)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="w-full space-y-3"
        >
          <Button
            data-ocid="payment.print_button"
            className="w-full h-14 text-base font-bold rounded-2xl gap-2 bg-primary hover:bg-primary/90 glow-btn"
            onClick={onPrintBill}
          >
            <Printer className="h-5 w-5" />
            Print Bill
          </Button>
          <Button
            data-ocid="payment.back_to_billing_button"
            variant="outline"
            className="w-full h-12 rounded-2xl border-2 font-semibold gap-2 border-primary text-primary"
            onClick={onBackToBilling}
          >
            <RefreshCw className="h-4 w-4" />
            Back to Billing
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Normal Payment Screen ───────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto p-5 space-y-5" data-ocid="payment.page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="payment.back_button"
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2
          className="font-bold text-xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Payment
        </h2>
      </div>

      {/* Total Amount card */}
      <div
        className="rounded-2xl p-6 text-center shadow-lg border border-primary/30"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.175 0.028 270) 0%, oklch(0.235 0.032 268) 100%)",
        }}
        data-ocid="payment.total_card"
      >
        <p className="text-sm text-muted-foreground mb-1 font-body uppercase tracking-wider">
          Total Amount
        </p>
        <p className="text-4xl font-bold font-display text-primary">
          {formatINR(total)}
        </p>
      </div>

      {/* Payment Method selector */}
      <div>
        <p className="text-sm font-semibold mb-3 font-body text-muted-foreground uppercase tracking-wide">
          Payment Method
        </p>
        <div
          className="grid grid-cols-2 gap-4"
          data-ocid="payment.method_select"
        >
          {/* Cash */}
          <button
            type="button"
            data-ocid="payment.cash_button"
            onClick={() => onSetMethod("Cash")}
            className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all min-h-[100px] active:scale-95 ${
              paymentMethod === "Cash"
                ? "border-primary bg-primary text-primary-foreground shadow-glow-orange"
                : "border-border bg-card hover:border-primary/50 hover:bg-primary/8 text-foreground"
            }`}
          >
            <Banknote
              className={`h-8 w-8 ${paymentMethod === "Cash" ? "text-primary-foreground" : "text-primary"}`}
            />
            <span
              className={`text-base font-bold ${paymentMethod === "Cash" ? "text-primary-foreground" : "text-primary"}`}
            >
              Cash
            </span>
          </button>

          {/* QR Payment */}
          <button
            type="button"
            data-ocid="payment.qr_button"
            onClick={() => onSetMethod("QR")}
            className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all min-h-[100px] active:scale-95 ${
              paymentMethod === "QR"
                ? "border-primary bg-primary/90 text-primary-foreground shadow-glow-orange"
                : "border-border bg-card hover:border-primary/50 hover:bg-primary/8 text-foreground"
            }`}
          >
            <QrCode
              className={`h-8 w-8 ${paymentMethod === "QR" ? "text-primary-foreground" : "text-primary"}`}
            />
            <span
              className={`text-base font-bold ${paymentMethod === "QR" ? "text-primary-foreground" : "text-primary"}`}
            >
              QR Pay
            </span>
          </button>
        </div>
      </div>

      {/* Cash: Amount Received + Balance */}
      {paymentMethod === "Cash" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pos-card p-4 space-y-4"
          data-ocid="payment.cash_panel"
        >
          <div>
            <Label className="text-sm font-semibold font-body mb-2 block">
              Amount Received (₹)
            </Label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder={`Enter amount (min ₹${total.toFixed(2)})`}
              value={cashReceived}
              onChange={(e) => onSetCashReceived(e.target.value)}
              className="h-14 text-lg font-bold rounded-xl border-2 focus-visible:ring-primary"
              data-ocid="payment.cash_received.input"
              autoFocus
            />
          </div>

          {/* Balance calculation */}
          {change !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl p-4 text-center ${
                change >= 0
                  ? "bg-card border border-primary/30"
                  : "bg-destructive/10 border border-destructive/30"
              }`}
              data-ocid={
                change >= 0
                  ? "payment.balance_success_state"
                  : "payment.balance_error_state"
              }
            >
              {change >= 0 ? (
                <div className="space-y-1">
                  <p
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#16A34A" }}
                  >
                    Balance to Return
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "#16A34A" }}
                  >
                    {formatINR(change)}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-semibold text-destructive">
                  Amount short by {formatINR(Math.abs(change))}
                </p>
              )}
            </motion.div>
          )}

          {/* Summary row */}
          <div className="space-y-1.5 pt-1 border-t border-border">
            <div className="flex justify-between text-sm text-muted-foreground font-body">
              <span>Total</span>
              <span className="font-semibold text-foreground">
                {formatINR(total)}
              </span>
            </div>
            {cashReceived && (
              <div className="flex justify-between text-sm text-muted-foreground font-body">
                <span>Received</span>
                <span className="font-semibold text-foreground">
                  {formatINR(Number.parseFloat(cashReceived) || 0)}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* QR Payment */}
      {paymentMethod === "QR" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pos-card p-5 text-center space-y-4"
          data-ocid="payment.qr_panel"
        >
          {upiId ? (
            <>
              <div>
                <p className="text-sm font-semibold font-body text-muted-foreground uppercase tracking-wide mb-1">
                  Scan to Pay
                </p>
                <p className="text-lg font-bold text-primary">
                  {formatINR(total)}
                </p>
              </div>
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl border-2 border-primary/50 inline-block bg-white">
                  <QRCodeSVG
                    value={upiDeepLink}
                    size={180}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#1E1E2E"
                  />
                </div>
              </div>
              <div className="bg-primary/8 rounded-xl p-3 text-sm border border-primary/20">
                <p className="text-primary font-semibold font-body">
                  UPI ID: {upiId}
                </p>
              </div>
              {/* UPI app icons row */}
              <div className="flex items-center justify-center gap-3">
                {/* Google Pay */}
                <div title="Google Pay" className="w-6 h-6 flex-shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    role="img"
                    aria-label="Google Pay"
                  >
                    <title>Google Pay</title>
                    <path
                      d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"
                      fill="#fff"
                    />
                    <path
                      d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"
                      fill="#4285F4"
                      fillOpacity=".1"
                    />
                    <text
                      x="12"
                      y="16"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="Arial,sans-serif"
                      fill="#4285F4"
                    >
                      G
                    </text>
                    <text
                      x="12"
                      y="16"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="Arial,sans-serif"
                      fill="url(#gpay-grad)"
                    >
                      G
                    </text>
                    <defs>
                      <linearGradient
                        id="gpay-grad"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#4285F4" />
                        <stop offset="33%" stopColor="#EA4335" />
                        <stop offset="66%" stopColor="#FBBC04" />
                        <stop offset="100%" stopColor="#34A853" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                {/* PhonePe */}
                <div
                  title="PhonePe"
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#5f259f" }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontSize: "9px",
                      fontWeight: "bold",
                      fontFamily: "Arial,sans-serif",
                    }}
                  >
                    Pe
                  </span>
                </div>
                {/* Paytm */}
                <div
                  title="Paytm"
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: "#00BAF2" }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontSize: "7px",
                      fontWeight: "bold",
                      fontFamily: "Arial,sans-serif",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    PTM
                  </span>
                </div>
                {/* UPI */}
                <div
                  title="UPI"
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: "#097939" }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontSize: "7px",
                      fontWeight: "bold",
                      fontFamily: "Arial,sans-serif",
                    }}
                  >
                    UPI
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-body">
                Ask customer to scan and confirm payment, then tap Complete
                Payment
              </p>
            </>
          ) : (
            <div className="py-6 space-y-3" data-ocid="payment.qr_no_upi_state">
              <QrCode className="h-12 w-12 mx-auto opacity-30" />
              <p className="font-semibold text-sm text-foreground">
                No UPI ID configured
              </p>
              <p className="text-xs text-muted-foreground font-body">
                Please go to Settings and add your UPI ID to enable QR payments.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Complete Payment button */}
      <Button
        data-ocid="payment.complete_button"
        className="w-full h-14 text-base font-bold rounded-2xl gap-2 bg-primary hover:bg-primary/90 glow-btn"
        disabled={
          paymentMethod === "Cash" &&
          (!cashReceived || Number.parseFloat(cashReceived) < total)
        }
        onClick={onComplete}
      >
        <Check className="h-5 w-5" />
        Complete Payment
      </Button>

      <button
        type="button"
        data-ocid="payment.cancel_button"
        onClick={onBack}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 rounded-xl hover:bg-secondary transition-colors font-body"
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
  const receiptDate = new Date(order.createdAt);
  const dateStr = receiptDate
    .toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-"); // converts to DD-MM-YYYY format
  const timeStr = receiptDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  function handlePrint() {
    const printArea = document.getElementById("bill-print-area");
    if (!printArea) {
      window.print();
      return;
    }
    const printWindow = window.open("", "_blank", "width=300,height=600");
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Bill - ${order.billNumber}</title>
  <style>
    @page { size: 58mm auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 58mm;
      max-width: 58mm;
      font-family: 'Courier New', Courier, monospace;
      font-size: 9pt;
      line-height: 1.35;
      color: #000;
      background: #fff;
      padding: 3mm;
    }
  </style>
</head>
<body>${printArea.innerHTML}</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }

  // Separator lines for thermal receipt
  const SEP_MAJOR = "================================";
  const SEP_MINOR = "--------------------------------";

  return (
    <div
      className="max-w-sm mx-auto p-4 space-y-4"
      data-ocid="bill_preview.page"
    >
      {/* Page header */}
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl font-bold flex-1">Bill Preview</h2>
        <Badge
          variant="outline"
          className="font-mono text-xs border-primary text-primary"
        >
          {order.billNumber}
        </Badge>
      </div>

      {/* Thermal Receipt — 58mm layout */}
      <div
        id="bill-print-area"
        className="bg-white rounded-lg border border-dashed border-gray-300 shadow-sm mx-auto"
        style={{
          maxWidth: "230px",
          padding: "12px",
          fontFamily: "'Courier New', Courier, monospace",
        }}
      >
        {/* Major separator */}
        <div className="font-mono text-[10px] overflow-hidden whitespace-nowrap text-black">
          {SEP_MAJOR}
        </div>

        {/* Hotel header */}
        <div className="text-center my-1">
          <p className="font-mono font-bold text-[13px] tracking-wide text-black">
            GOBINATH HOTEL
          </p>
          <p className="font-mono text-[11px] text-black">
            {branch.short.toUpperCase()}
          </p>
          {gstSettings.enabled && gstSettings.gstNumber && (
            <p className="font-mono text-[10px] text-black">
              GSTIN: {gstSettings.gstNumber}
            </p>
          )}
        </div>

        {/* Major separator */}
        <div className="font-mono text-[10px] overflow-hidden whitespace-nowrap text-black">
          {SEP_MAJOR}
        </div>

        {/* Bill info */}
        <div className="my-1 space-y-0">
          <div className="flex font-mono text-[11px] text-black">
            <span className="w-20">Bill No </span>
            <span className="font-bold">: {order.billNumber}</span>
          </div>
          <div className="flex font-mono text-[11px] text-black">
            <span className="w-20">Date </span>
            <span>: {dateStr}</span>
          </div>
          <div className="flex font-mono text-[11px] text-black">
            <span className="w-20">Time </span>
            <span>: {timeStr}</span>
          </div>
          {order.customerName && (
            <div className="flex font-mono text-[11px] text-black">
              <span className="w-20">Customer</span>
              <span className="truncate">: {order.customerName}</span>
            </div>
          )}
          {order.customerMobile && (
            <div className="flex font-mono text-[11px] text-black">
              <span className="w-20">Mobile </span>
              <span>: {order.customerMobile}</span>
            </div>
          )}
        </div>

        {/* Major separator */}
        <div className="font-mono text-[10px] overflow-hidden whitespace-nowrap text-black">
          {SEP_MAJOR}
        </div>

        {/* Items header */}
        <div className="flex font-mono text-[11px] font-bold text-black my-1">
          <span className="flex-1">Item</span>
          <span className="w-8 text-center">Qty</span>
          <span className="w-20 text-right">Price</span>
        </div>

        {/* Minor separator */}
        <div className="font-mono text-[10px] overflow-hidden whitespace-nowrap text-black">
          {SEP_MINOR}
        </div>

        {/* Items */}
        <div className="space-y-0 my-1">
          {order.items.map((item) => (
            <div
              key={item.menuItemId}
              className="flex font-mono text-[11px] text-black"
            >
              <span className="flex-1 truncate pr-1">
                {item.name.length > 14 ? item.name.slice(0, 14) : item.name}
              </span>
              <span className="w-8 text-center">{item.quantity}</span>
              <span className="w-20 text-right">
                &#8377;{(item.price * item.quantity).toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        {/* Minor separator */}
        <div className="font-mono text-[10px] overflow-hidden whitespace-nowrap text-black">
          {SEP_MINOR}
        </div>

        {/* Subtotal / GST */}
        <div className="my-1 space-y-0">
          <div className="flex font-mono text-[11px] text-black">
            <span className="flex-1">Subtotal</span>
            <span className="w-20 text-right">
              &#8377;{order.subtotal.toFixed(2)}
            </span>
          </div>
          {order.gstAmount > 0 && (
            <div className="flex font-mono text-[11px] text-black">
              <span className="flex-1">GST ({gstSettings.percentage}%)</span>
              <span className="w-20 text-right">
                &#8377;{order.gstAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Major separator */}
        <div className="font-mono text-[10px] overflow-hidden whitespace-nowrap text-black">
          {SEP_MAJOR}
        </div>

        {/* Total */}
        <div className="flex font-mono font-bold text-[13px] text-black my-1">
          <span className="flex-1">TOTAL</span>
          <span className="w-20 text-right">
            &#8377;{order.total.toFixed(2)}
          </span>
        </div>

        {/* Major separator */}
        <div className="font-mono text-[10px] overflow-hidden whitespace-nowrap text-black">
          {SEP_MAJOR}
        </div>

        {/* Payment */}
        <div className="my-1">
          <div className="flex font-mono text-[11px] text-black">
            <span className="w-20">Payment </span>
            <span className="font-semibold">: {order.paymentMethod}</span>
          </div>
        </div>

        {/* Major separator */}
        <div className="font-mono text-[10px] overflow-hidden whitespace-nowrap text-black">
          {SEP_MAJOR}
        </div>

        {/* Footer */}
        <div className="text-center my-1">
          <p className="font-mono font-bold text-[11px] text-black">
            ** Thank You **
          </p>
          <p className="font-mono text-[11px] text-black">Visit Again</p>
        </div>

        {/* Major separator */}
        <div className="font-mono text-[10px] overflow-hidden whitespace-nowrap text-black">
          {SEP_MAJOR}
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3 mt-4">
        {/* Primary: Print Bill */}
        <Button
          data-ocid="bill_preview.print_button"
          className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 rounded-2xl gap-2 glow-btn"
          onClick={handlePrint}
        >
          <Printer className="h-5 w-5" />
          Print Bill
        </Button>

        {/* Secondary: Back to Billing */}
        <Button
          data-ocid="bill_preview.new_order_button"
          variant="outline"
          className="w-full h-12 rounded-2xl border-2 border-primary text-primary font-semibold gap-2"
          onClick={onNewOrder}
        >
          <RefreshCw className="h-4 w-4" />
          Back to Billing
        </Button>

        {/* Tertiary: Dashboard (owner only) */}
        {role === "owner" && (
          <button
            type="button"
            data-ocid="bill_preview.dashboard_button"
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 rounded-xl hover:bg-secondary transition-colors"
            onClick={onDashboard}
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

// ── MenuScreen ────────────────────────────────────────────────────────────────

function MenuScreen({
  menuItems,
  branchId,
  onUpdate,
  allItems,
  onBack: _onBack,
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
              className="pos-card p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary/50 flex items-center justify-center flex-shrink-0 border border-border">
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
        <DialogContent className="max-w-sm rounded-2xl bg-card shadow-xl p-0 overflow-hidden border border-border">
          {/* Dialog Header */}
          <div className="bg-primary px-5 py-4">
            <DialogTitle className="font-display text-primary-foreground text-lg font-bold tracking-wide">
              {editItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
            <p className="text-primary-foreground/70 text-xs mt-0.5 font-body">
              Fill in the details below
            </p>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Item Name */}
            <div>
              <Label className="text-xs font-semibold text-primary uppercase tracking-wide font-body">
                Item Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Masala Dosa"
                className="mt-1.5 rounded-xl bg-input border-border h-11 font-body"
                data-ocid="menu.item_name.input"
              />
            </div>

            {/* Price + Category row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-primary uppercase tracking-wide font-body">
                  Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="0.00"
                  className="mt-1.5 rounded-xl bg-input border-border h-11 font-body"
                  data-ocid="menu.item_price.input"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-primary uppercase tracking-wide font-body">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as Category }))
                  }
                >
                  <SelectTrigger
                    className="mt-1.5 rounded-xl bg-input border-border h-11 font-body"
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
              <Label className="text-xs font-semibold text-primary uppercase tracking-wide font-body">
                Food Image
              </Label>
              <div className="mt-1.5">
                {form.imageUrl ? (
                  /* Image preview card */
                  <div className="relative rounded-xl overflow-hidden border border-border bg-secondary/30 shadow-sm">
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
                    className="flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                    data-ocid="menu.upload_button"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/15">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-primary font-body">
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
            <div className="flex items-center gap-3 bg-secondary/40 rounded-xl px-3 py-2.5 border border-border">
              <Switch
                id="available"
                checked={form.available}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, available: v }))
                }
                className="data-[state=checked]:bg-primary"
              />
              <div>
                <Label
                  htmlFor="available"
                  className="text-sm font-semibold cursor-pointer font-body text-primary"
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
              className="flex-1 rounded-xl h-11 border-primary/30 text-primary font-body"
              data-ocid="menu.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.price}
              className="flex-1 rounded-xl h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-body glow-btn"
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
  onBack: _onBack,
}: { orders: Order[]; onBack: () => void }) {
  const today = new Date();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));
  const [activeTab, setActiveTab] = useState("analytics");
  const [branchFilter, setBranchFilter] = useState<"all" | "1" | "2">("all");

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

  // Payment method breakdown (supports new "QR" and legacy "UPI"/"Card")
  const paymentData = useMemo(() => {
    const counts: Record<string, number> = { Cash: 0, QR: 0 };
    for (const o of filteredOrders) {
      // Handle new "QR" and legacy "UPI"/"Card" payment methods
      const pm = o.paymentMethod as string;
      const key = pm === "UPI" || pm === "Card" ? "QR" : pm;
      counts[key] = (counts[key] || 0) + o.total;
    }
    return [
      { name: "Cash", value: Math.round(counts.Cash || 0), color: "#FF7A45" },
      {
        name: "QR Pay",
        value: Math.round(counts.QR || 0),
        color: "oklch(0.52 0.09 210)",
      },
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

  // Bill History filtered
  const billHistoryOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => b.createdAt - a.createdAt);
    if (branchFilter === "all") return sorted;
    return sorted.filter((o) => o.branchId === Number(branchFilter));
  }, [orders, branchFilter]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl font-bold">Reports</h2>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        data-ocid="reports.tab"
      >
        <TabsList className="grid grid-cols-2 w-full rounded-xl">
          <TabsTrigger
            value="analytics"
            data-ocid="reports.analytics_tab"
            className="rounded-lg"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="bill-history"
            data-ocid="reports.bill_history_tab"
            className="rounded-lg"
          >
            Bill History
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-5 mt-4">
          {/* Date range */}
          <div className="pos-card p-4">
            <p className="text-sm font-semibold mb-3">Date Range</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 h-10"
                  data-ocid="reports.start_date.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 h-10"
                  data-ocid="reports.end_date.input"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="pos-card p-4 text-center">
              <p className="text-lg font-bold text-primary">
                {formatINR(totalRevenue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Revenue</p>
            </div>
            <div className="pos-card p-4 text-center">
              <p className="text-lg font-bold text-accent">
                {filteredOrders.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Orders</p>
            </div>
            <div className="pos-card p-4 text-center">
              <p className="text-lg font-bold text-foreground">
                {formatINR(avgOrder)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Avg Order</p>
            </div>
          </div>

          {/* Daily sales chart */}
          <div className="pos-card p-4">
            <p className="text-sm font-semibold mb-3">Daily Sales (&#8377;)</p>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={dailyData}
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#3A3A4F"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#B8B8C5" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#B8B8C5" }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip formatter={(v) => [`₹${v}`, "Sales"]} />
                  <Bar dataKey="sales" fill="#FF7A45" radius={[4, 4, 0, 0]} />
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
            <div className="pos-card p-4">
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
                      <span className="font-semibold">&#8377;{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Branch comparison */}
          <div className="pos-card p-4">
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
                  stroke="#3A3A4F"
                />
                <XAxis
                  dataKey="branch"
                  tick={{ fontSize: 11, fill: "#B8B8C5" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#B8B8C5" }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip formatter={(v) => [`₹${v}`, "Sales"]} />
                <Bar dataKey="sales" fill="#FF7A45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Bill History Tab */}
        <TabsContent value="bill-history" className="space-y-4 mt-4">
          {/* Branch filter */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              Filter by Branch:
            </p>
            <Select
              value={branchFilter}
              onValueChange={(v) => setBranchFilter(v as "all" | "1" | "2")}
            >
              <SelectTrigger
                className="h-9 rounded-xl flex-1 max-w-xs"
                data-ocid="reports.branch_filter.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="1">
                  Gobinath Hotel &#8211; Sethurapatti
                </SelectItem>
                <SelectItem value="2">
                  Gobinath Hotel &#8211; JJ College
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bill list */}
          {billHistoryOrders.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="reports.bill_history_empty_state"
            >
              <BarChart2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No bills found</p>
            </div>
          ) : (
            <div className="space-y-2" data-ocid="reports.bill_history.list">
              {billHistoryOrders.map((order, idx) => {
                const branchObj = BRANCHES.find((b) => b.id === order.branchId);
                return (
                  <div
                    key={order.id}
                    data-ocid={`reports.bill_history.item.${idx + 1}`}
                    className="pos-card p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-primary">
                            {order.billNumber}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] py-0 px-1.5 ${order.branchId === 1 ? "border-primary/60 text-primary" : "border-accent/60 text-accent"}`}
                          >
                            {branchObj?.short}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-1.5"
                          >
                            {order.paymentMethod}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                          {order.customerName && ` · ${order.customerName}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <p className="font-bold text-sm text-primary whitespace-nowrap">
                        {formatINR(order.total)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── EmployeesScreen ───────────────────────────────────────────────────────────

// Helper computations
function totalAdvanceTaken(emp: Employee): number {
  return emp.advances.reduce((s, a) => s + a.amount, 0);
}
function totalSalaryPaid(
  employeeId: string,
  payments: SalaryPayment[],
): number {
  return payments
    .filter((p) => p.employeeId === employeeId && p.type === "Salary")
    .reduce((s, p) => s + p.amount, 0);
}
function remainingBalance(emp: Employee): number {
  return emp.salary - totalAdvanceTaken(emp);
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const ROLE_COLOR_MAP: Record<string, string> = {
  Waiter: "bg-blue-900/50 text-blue-300 border-blue-700/50",
  Cook: "bg-orange-900/50 text-orange-300 border-orange-700/50",
  Cleaner: "bg-purple-900/50 text-purple-300 border-purple-700/50",
  Manager: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
  Cashier: "bg-teal-900/50 text-teal-300 border-teal-700/50",
};

function getRoleColor(role: string): string {
  return (
    ROLE_COLOR_MAP[role] ?? "bg-gray-700/50 text-gray-300 border-gray-600/50"
  );
}

const AVATAR_COLORS = [
  "bg-emerald-600",
  "bg-orange-500",
  "bg-blue-600",
  "bg-purple-600",
  "bg-teal-600",
  "bg-rose-600",
];

function EmployeesScreen({
  employees,
  branchId,
  onUpdate,
  allEmployees,
  onBack: _onBack,
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
  const [advanceTarget, setAdvanceTarget] = useState<Employee | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(
    new Set(),
  );

  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    mobile: "",
    address: "",
    role: "Waiter" as string,
    customRole: "",
    isCustomRole: false,
    salaryType: "Monthly" as Employee["salaryType"],
    salary: "",
    advanceAmount: "",
    advanceDate: todayStr(),
    salaryPaid: false,
    dateOfJoin: todayStr(),
  });

  const [advanceForm, setAdvanceForm] = useState({
    amount: "",
    date: todayStr(),
    reason: "",
  });

  function openAdd() {
    setEditEmp(null);
    const nextId = generateEmployeeId(allEmployees);
    setForm({
      name: "",
      employeeId: nextId,
      mobile: "",
      address: "",
      role: "Waiter",
      customRole: "",
      isCustomRole: false,
      salaryType: "Monthly",
      salary: "",
      advanceAmount: "",
      advanceDate: todayStr(),
      salaryPaid: false,
      dateOfJoin: todayStr(),
    });
    setShowModal(true);
  }

  function openEdit(emp: Employee) {
    setEditEmp(emp);
    const knownRoles = ["Waiter", "Cook", "Cleaner", "Manager", "Cashier"];
    const isCustom = !knownRoles.includes(emp.role);
    setForm({
      name: emp.name,
      employeeId: emp.employeeId,
      mobile: emp.mobile,
      address: emp.address,
      role: isCustom ? "__custom__" : emp.role,
      customRole: isCustom ? emp.role : "",
      isCustomRole: isCustom,
      salaryType: emp.salaryType,
      salary: String(emp.salary),
      advanceAmount: "",
      advanceDate: todayStr(),
      salaryPaid: emp.salaryPaid,
      dateOfJoin: emp.dateOfJoin ?? todayStr(),
    });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.salary) return;
    const resolvedRole =
      form.role === "__custom__"
        ? form.customRole.trim() || "Staff"
        : form.role;
    if (editEmp) {
      onUpdate(
        allEmployees.map((e) =>
          e.id === editEmp.id
            ? {
                ...e,
                employeeId: form.employeeId.trim() || e.employeeId,
                name: form.name,
                mobile: form.mobile,
                address: form.address,
                role: resolvedRole,
                salaryType: form.salaryType,
                salary: Number.parseFloat(form.salary),
                salaryPaid: form.salaryPaid,
                dateOfJoin: form.dateOfJoin,
              }
            : e,
        ),
      );
      toast.success("Employee updated");
    } else {
      const initialAdvances: AdvanceRecord[] = [];
      const advAmt = Number.parseFloat(form.advanceAmount);
      if (advAmt > 0) {
        initialAdvances.push({
          id: generateId(),
          amount: advAmt,
          date: form.advanceDate,
          reason: "",
          createdAt: Date.now(),
        });
      }
      const newEmp: Employee = {
        id: generateId(),
        branchId,
        employeeId: form.employeeId.trim() || generateEmployeeId(allEmployees),
        name: form.name,
        mobile: form.mobile,
        address: form.address,
        role: resolvedRole,
        salaryType: form.salaryType,
        salary: Number.parseFloat(form.salary),
        salaryPaid: form.salaryPaid,
        advances: initialAdvances,
        dateOfJoin: form.dateOfJoin,
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

  function handleAddAdvance() {
    if (!advanceTarget || !advanceForm.amount) return;
    const newAdvance: AdvanceRecord = {
      id: generateId(),
      amount: Number.parseFloat(advanceForm.amount),
      date: advanceForm.date,
      reason: advanceForm.reason,
      createdAt: Date.now(),
    };
    onUpdate(
      allEmployees.map((e) =>
        e.id === advanceTarget.id
          ? { ...e, advances: [...e.advances, newAdvance] }
          : e,
      ),
    );
    toast.success(
      `Advance ₹${advanceForm.amount} added for ${advanceTarget.name}`,
    );
    setAdvanceTarget(null);
    setAdvanceForm({ amount: "", date: todayStr(), reason: "" });
  }

  function toggleHistory(empId: string) {
    setExpandedHistory((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) next.delete(empId);
      else next.add(empId);
      return next;
    });
  }

  const branchEmployees = employees.filter((e) => e.branchId === branchId);

  // Financial summary
  const totalSalaryExpense = branchEmployees.reduce((s, e) => s + e.salary, 0);
  const totalAdvanceGiven = branchEmployees.reduce(
    (s, e) => s + totalAdvanceTaken(e),
    0,
  );
  const pendingCount = branchEmployees.filter((e) => !e.salaryPaid).length;

  const summaryCards = [
    {
      label: "Total Employees",
      value: String(branchEmployees.length),
      icon: <Users className="h-5 w-5 text-primary" />,
      valueClass: "text-primary",
    },
    {
      label: "Total Salary Expense",
      value: `₹${totalSalaryExpense.toLocaleString("en-IN")}`,
      icon: <IndianRupee className="h-5 w-5 text-primary" />,
      valueClass: "text-primary",
    },
    {
      label: "Total Advance Given",
      value: `₹${totalAdvanceGiven.toLocaleString("en-IN")}`,
      icon: <Wallet className="h-5 w-5 text-accent" />,
      valueClass: "text-accent",
    },
    {
      label: "Pending Salary",
      value: `${pendingCount} Pending`,
      icon: <Clock className="h-5 w-5 text-destructive" />,
      valueClass: "text-destructive",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-5" data-ocid="employees.page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Employees</h2>
        <Button
          data-ocid="employees.add_button"
          onClick={openAdd}
          className="h-11 bg-primary hover:bg-primary/90 rounded-xl gap-2 font-body font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Financial Summary */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        data-ocid="employees.summary_section"
      >
        {summaryCards.map((card) => (
          <div key={card.label} className="pos-card rounded-2xl p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 bg-primary/15">
              {card.icon}
            </div>
            <p
              className={`text-xl font-bold font-display leading-tight ${card.valueClass}`}
            >
              {card.value}
            </p>
            <p className="text-xs font-body mt-0.5 text-muted-foreground">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Employee Cards */}
      {branchEmployees.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground pos-card"
          data-ocid="employees.empty_state"
        >
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg font-semibold">
            No employees added yet
          </p>
          <p className="text-sm font-body mt-1 opacity-70">
            Tap "Add Employee" to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branchEmployees.map((emp, idx) => {
            const advance = totalAdvanceTaken(emp);
            const balance = remainingBalance(emp);
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const isHistoryOpen = expandedHistory.has(emp.id);

            return (
              <div
                key={emp.id}
                data-ocid={`employees.item.${idx + 1}`}
                className="pos-card p-0 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm`}
                      >
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-display font-bold text-base text-foreground">
                          {emp.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground font-body font-medium">
                            {emp.employeeId}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-body font-medium ${getRoleColor(emp.role)}`}
                          >
                            {emp.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        data-ocid={`employees.advance_button.${idx + 1}`}
                        onClick={() => {
                          setAdvanceTarget(emp);
                          setAdvanceForm({
                            amount: "",
                            date: todayStr(),
                            reason: "",
                          });
                        }}
                        className="p-2 rounded-xl hover:bg-primary/15 text-primary transition-colors"
                        title="Add Advance"
                      >
                        <Wallet className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        data-ocid={`employees.edit_button.${idx + 1}`}
                        onClick={() => openEdit(emp)}
                        className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"
                        title="Edit Employee"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        data-ocid={`employees.delete_button.${idx + 1}`}
                        onClick={() => setDeleteTarget(emp.id)}
                        className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="mt-2 space-y-1 ml-[60px]">
                    {emp.mobile && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs font-body text-muted-foreground">
                          {emp.mobile}
                        </span>
                      </div>
                    )}
                    {emp.dateOfJoin && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs font-body text-muted-foreground">
                          Joined: {formatDate(emp.dateOfJoin)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Salary Details */}
                <div className="px-4 pb-3 space-y-2">
                  <div className="bg-secondary/40 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-body text-muted-foreground">
                        {emp.salaryType} Salary
                      </span>
                      <span className="text-sm font-bold font-display text-primary">
                        ₹{emp.salary.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {advance > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-body text-accent">
                            Advance Taken
                          </span>
                          <span className="text-sm font-semibold text-accent">
                            −₹{advance.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="border-t border-border/40 pt-2 flex items-center justify-between">
                          <span className="text-xs font-body text-foreground font-medium">
                            Balance
                          </span>
                          <span
                            className={`text-sm font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}
                          >
                            ₹{balance.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Status Badge + Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={emp.salaryPaid}
                        onCheckedChange={() =>
                          onUpdate(
                            allEmployees.map((e) =>
                              e.id === emp.id
                                ? { ...e, salaryPaid: !e.salaryPaid }
                                : e,
                            ),
                          )
                        }
                        className="data-[state=checked]:bg-green-600"
                        data-ocid={"employees.status.switch"}
                      />
                      <span className="text-xs font-body text-muted-foreground">
                        {emp.salaryPaid ? "Mark as Pending" : "Mark as Paid"}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold font-body px-3 py-1 rounded-full border ${
                        emp.salaryPaid
                          ? "bg-green-900/50 text-green-300 border-green-700/50"
                          : "bg-orange-900/50 text-orange-300 border-orange-700/50"
                      }`}
                    >
                      {emp.salaryPaid ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Advance History Toggle */}
                <div className="border-t border-border/40">
                  <button
                    type="button"
                    data-ocid={`employees.advance_history_toggle.${idx + 1}`}
                    onClick={() => toggleHistory(emp.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold font-body text-muted-foreground">
                      <History className="h-3.5 w-3.5" />
                      Advance History ({emp.advances.length})
                    </div>
                    {isHistoryOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {isHistoryOpen && (
                    <div
                      data-ocid={`employees.advance_history.${idx + 1}`}
                      className="px-4 pb-3 space-y-2"
                    >
                      {emp.advances.length === 0 ? (
                        <p className="text-xs font-body text-muted-foreground py-2 text-center">
                          No advances recorded
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {[...emp.advances]
                            .sort((a, b) => b.createdAt - a.createdAt)
                            .map((adv) => (
                              <div
                                key={adv.id}
                                className="flex items-start justify-between text-xs font-body bg-primary/8 rounded-lg px-3 py-2"
                              >
                                <div>
                                  <span className="text-primary font-semibold">
                                    {formatDate(adv.date)}
                                  </span>
                                  {adv.reason && (
                                    <span className="text-muted-foreground ml-1">
                                      · {adv.reason}
                                    </span>
                                  )}
                                </div>
                                <span className="font-bold text-primary ml-2 flex-shrink-0">
                                  ₹{adv.amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit Employee Modal ── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="max-w-md rounded-2xl overflow-hidden p-0"
          data-ocid="employees.modal.dialog"
        >
          {/* Modal header */}
          <div className="px-5 py-4 bg-primary">
            <DialogHeader>
              <DialogTitle className="font-display text-primary-foreground font-bold text-lg">
                {editEmp ? "Edit Employee" : "Add Employee"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto bg-card">
            {/* Employee ID */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Employee ID{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (optional, auto-generated)
                </span>
              </Label>
              <Input
                value={form.employeeId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, employeeId: e.target.value }))
                }
                placeholder="e.g. EMP-001"
                className="mt-1.5 h-11 rounded-xl font-mono text-sm"
                data-ocid="employees.employee_id.input"
              />
            </div>

            {/* Name */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Employee Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Full name"
                className="mt-1.5 h-11 rounded-xl"
                data-ocid="employees.name.input"
              />
            </div>

            {/* Mobile */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Mobile Number
              </Label>
              <Input
                value={form.mobile}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mobile: e.target.value }))
                }
                placeholder="10-digit mobile number"
                inputMode="tel"
                className="mt-1.5 h-11 rounded-xl"
                data-ocid="employees.mobile.input"
              />
            </div>

            {/* Address */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Address
              </Label>
              <Textarea
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Street address, city"
                rows={2}
                className="mt-1.5 rounded-xl resize-none"
                data-ocid="employees.address.textarea"
              />
            </div>

            {/* Role */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Role
              </Label>
              <Select
                value={form.role}
                onValueChange={(v) => {
                  if (v === "__custom__") {
                    setForm((f) => ({
                      ...f,
                      role: "__custom__",
                      isCustomRole: true,
                    }));
                  } else {
                    setForm((f) => ({
                      ...f,
                      role: v,
                      isCustomRole: false,
                      customRole: "",
                    }));
                  }
                }}
              >
                <SelectTrigger
                  className="mt-1.5 h-11 rounded-xl"
                  data-ocid="employees.role.select"
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {["Waiter", "Cook", "Cleaner", "Manager", "Cashier"].map(
                    (r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ),
                  )}
                  <SelectItem value="__custom__">Custom Role...</SelectItem>
                </SelectContent>
              </Select>
              {form.isCustomRole && (
                <Input
                  value={form.customRole}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customRole: e.target.value }))
                  }
                  placeholder="Enter custom role (e.g. Driver, Security)"
                  className="mt-2 h-11 rounded-xl"
                  data-ocid="employees.custom_role.input"
                />
              )}
            </div>

            {/* Date of Join */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Date of Join
              </Label>
              <Input
                type="date"
                value={form.dateOfJoin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateOfJoin: e.target.value }))
                }
                className="mt-1.5 h-11 rounded-xl"
                data-ocid="employees.date_of_join.input"
              />
            </div>

            {/* Salary Type */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Salary Type
              </Label>
              <Select
                value={form.salaryType}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    salaryType: v as Employee["salaryType"],
                  }))
                }
              >
                <SelectTrigger
                  className="mt-1.5 h-11 rounded-xl"
                  data-ocid="employees.salary_type.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly Salary</SelectItem>
                  <SelectItem value="Daily">Daily Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Salary Amount */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Salary Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                inputMode="numeric"
                value={form.salary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, salary: e.target.value }))
                }
                placeholder={
                  form.salaryType === "Monthly" ? "e.g. 12000" : "e.g. 500"
                }
                className="mt-1.5 h-11 rounded-xl"
                data-ocid="employees.salary.input"
              />
            </div>

            {/* Initial Advance (Add only) */}
            {!editEmp && (
              <>
                <div>
                  <Label className="text-sm font-body font-medium text-foreground">
                    Initial Advance Amount (₹){" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={form.advanceAmount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, advanceAmount: e.target.value }))
                    }
                    placeholder="0"
                    className="mt-1.5 h-11 rounded-xl"
                    data-ocid="employees.advance_amount.input"
                  />
                </div>
                {Number.parseFloat(form.advanceAmount) > 0 && (
                  <div>
                    <Label className="text-sm font-body font-medium text-foreground">
                      Advance Date
                    </Label>
                    <Input
                      type="date"
                      value={form.advanceDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, advanceDate: e.target.value }))
                      }
                      className="mt-1.5 h-11 rounded-xl"
                      data-ocid="employees.advance_date.input"
                    />
                  </div>
                )}
              </>
            )}

            {/* Salary Status */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <Label className="text-sm font-body font-medium text-foreground">
                  Salary Status
                </Label>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  Current payment status
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-body text-muted-foreground">
                  {form.salaryPaid ? "Paid" : "Pending"}
                </span>
                <Switch
                  checked={form.salaryPaid}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, salaryPaid: v }))
                  }
                  className="data-[state=checked]:bg-green-600"
                  data-ocid="employees.status.switch"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 p-4 border-t border-border bg-card">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="flex-1 h-11 rounded-xl font-body border-border text-foreground"
              data-ocid="employees.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.salary}
              className="flex-1 h-11 rounded-xl font-body font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-btn"
              data-ocid="employees.save_button"
            >
              {editEmp ? "Save Changes" : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Advance Modal ── */}
      <Dialog
        open={!!advanceTarget}
        onOpenChange={(o) => !o && setAdvanceTarget(null)}
      >
        <DialogContent
          className="max-w-sm rounded-2xl overflow-hidden p-0"
          data-ocid="employees.advance_modal.dialog"
        >
          <div className="px-5 py-4 bg-primary">
            <DialogHeader>
              <DialogTitle className="font-display text-primary-foreground font-bold text-lg">
                Add Advance
              </DialogTitle>
              {advanceTarget && (
                <p className="text-primary-foreground/70 text-sm font-body mt-0.5">
                  For: {advanceTarget.name}
                </p>
              )}
            </DialogHeader>
          </div>

          <div className="p-5 space-y-4 bg-card">
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Advance Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                inputMode="numeric"
                value={advanceForm.amount}
                onChange={(e) =>
                  setAdvanceForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="e.g. 2000"
                className="mt-1.5 h-11 rounded-xl"
                data-ocid="employees.advance_amount.input"
              />
            </div>
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                <Calendar className="inline h-3.5 w-3.5 mr-1" />
                Advance Date
              </Label>
              <Input
                type="date"
                value={advanceForm.date}
                onChange={(e) =>
                  setAdvanceForm((f) => ({ ...f, date: e.target.value }))
                }
                className="mt-1.5 h-11 rounded-xl"
                data-ocid="employees.advance_date.input"
              />
            </div>
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Reason / Notes{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                value={advanceForm.reason}
                onChange={(e) =>
                  setAdvanceForm((f) => ({ ...f, reason: e.target.value }))
                }
                placeholder="e.g. Medical emergency, Festival advance"
                rows={2}
                className="mt-1.5 rounded-xl resize-none"
              />
            </div>

            {/* Preview */}
            {Number.parseFloat(advanceForm.amount) > 0 && advanceTarget && (
              <div className="bg-primary/8 border border-primary/20 rounded-xl p-3 text-sm space-y-1 font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Salary</span>
                  <span className="font-semibold text-foreground">
                    ₹{advanceTarget.salary.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Advance</span>
                  <span className="font-semibold">
                    ₹
                    {Number.parseFloat(advanceForm.amount).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-bold">
                  <span>Balance</span>
                  <span
                    className={
                      advanceTarget.salary -
                        totalAdvanceTaken(advanceTarget) -
                        Number.parseFloat(advanceForm.amount) >=
                      0
                        ? "text-primary"
                        : "text-destructive"
                    }
                  >
                    ₹
                    {(
                      advanceTarget.salary -
                      totalAdvanceTaken(advanceTarget) -
                      Number.parseFloat(advanceForm.amount)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 p-4 border-t border-border bg-card">
            <Button
              variant="outline"
              onClick={() => setAdvanceTarget(null)}
              className="flex-1 h-11 rounded-xl font-body border-border text-foreground"
              data-ocid="employees.advance_cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAdvance}
              disabled={
                !advanceForm.amount ||
                Number.parseFloat(advanceForm.amount) <= 0
              }
              className="flex-1 h-11 rounded-xl font-body font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-btn"
              data-ocid="employees.advance_save_button"
            >
              Add Advance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className="max-w-sm rounded-2xl"
          data-ocid="employees.delete_confirm.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Remove Employee?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will permanently remove the employee and all their advance
              records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="employees.cancel_button"
              className="rounded-xl font-body"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 rounded-xl font-body"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              data-ocid="employees.confirm_button"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── SettingsScreen ────────────────────────────────────────────────────────────

function SettingsScreen({
  gstSettings,
  upiSettings,
  branchId,
  onUpdateGst,
  onUpdateUpi,
  onBack: _onBack,
}: {
  gstSettings: GSTSettings[];
  upiSettings: UpiSettings[];
  branchId: number;
  onUpdateGst: (settings: GSTSettings[]) => void;
  onUpdateUpi: (settings: UpiSettings[]) => void;
  onBack: () => void;
}) {
  const currentGst = gstSettings.find((g) => g.branchId === branchId) ?? {
    branchId,
    enabled: false,
    gstNumber: "",
    percentage: 5,
  };
  const currentUpi = upiSettings.find((u) => u.branchId === branchId) ?? {
    branchId,
    upiId: "",
  };

  const [gstForm, setGstForm] = useState({
    enabled: currentGst.enabled,
    gstNumber: currentGst.gstNumber,
    percentage: String(currentGst.percentage),
  });

  const [upiId, setUpiId] = useState(currentUpi.upiId);

  function handleSaveGst() {
    const updated = gstSettings.some((g) => g.branchId === branchId)
      ? gstSettings.map((g) =>
          g.branchId === branchId
            ? {
                ...g,
                enabled: gstForm.enabled,
                gstNumber: gstForm.gstNumber,
                percentage: Number.parseFloat(gstForm.percentage) || 5,
              }
            : g,
        )
      : [
          ...gstSettings,
          {
            branchId,
            enabled: gstForm.enabled,
            gstNumber: gstForm.gstNumber,
            percentage: Number.parseFloat(gstForm.percentage) || 5,
          },
        ];
    onUpdateGst(updated);
    toast.success("GST settings saved!");
  }

  function handleSaveUpi() {
    const updated = upiSettings.some((u) => u.branchId === branchId)
      ? upiSettings.map((u) =>
          u.branchId === branchId ? { ...u, upiId: upiId.trim() } : u,
        )
      : [...upiSettings, { branchId, upiId: upiId.trim() }];
    onUpdateUpi(updated);
    toast.success("UPI settings saved!");
  }

  const branch = BRANCHES.find((b) => b.id === branchId);

  // Preview UPI QR
  const previewQr = upiId.trim()
    ? `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent("Gobinath Hotel")}&am=1&cu=INR`
    : "";

  return (
    <div className="max-w-md mx-auto p-4 space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl font-bold">Settings</h2>
      </div>
      <p className="text-sm text-muted-foreground font-body">{branch?.name}</p>

      {/* ── UPI Payment Settings ─────────────────────────── */}
      <div className="pos-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/12">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">UPI Payment (QR)</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Used to generate QR codes at billing
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium font-body">UPI ID</Label>
          <Input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. 9876543210@paytm or name@ybl"
            className="mt-1.5 h-11 rounded-xl"
            data-ocid="settings.upi_id.input"
          />
          <p className="text-xs text-muted-foreground mt-1 font-body">
            Your UPI ID — payments will go to this account
          </p>
        </div>

        {/* Live QR preview */}
        {previewQr && (
          <div className="flex flex-col items-center gap-2 p-3 bg-primary/8 rounded-xl border border-primary/20">
            <p className="text-xs font-semibold text-primary font-body">
              QR Preview
            </p>
            <div className="p-2 bg-white rounded-lg border border-primary/30">
              <QRCodeSVG
                value={previewQr}
                size={100}
                level="M"
                fgColor="#1E1E2E"
              />
            </div>
            <p className="text-xs text-primary font-body">{upiId.trim()}</p>
          </div>
        )}

        <Button
          data-ocid="settings.save_upi_button"
          className="w-full h-11 font-semibold rounded-xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground glow-btn"
          onClick={handleSaveUpi}
        >
          <Check className="h-4 w-4" />
          Save UPI Settings
        </Button>
      </div>

      {/* ── GST Settings ─────────────────────────────────── */}
      <div className="pos-card p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/12">
            <IndianRupee className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">GST Settings</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Apply GST on bills for this branch
            </p>
          </div>
        </div>

        <Separator />

        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Enable GST</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Include GST in billing calculations
            </p>
          </div>
          <Switch
            data-ocid="settings.gst_toggle"
            checked={gstForm.enabled}
            onCheckedChange={(v) => setGstForm((f) => ({ ...f, enabled: v }))}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* GST Number */}
        <div>
          <Label className="text-sm font-medium font-body">
            GST Number (GSTIN)
          </Label>
          <Input
            value={gstForm.gstNumber}
            onChange={(e) =>
              setGstForm((f) => ({ ...f, gstNumber: e.target.value }))
            }
            placeholder="e.g. 33XXXXX1234X1ZX"
            className="mt-1.5 h-11 rounded-xl"
            disabled={!gstForm.enabled}
            data-ocid="settings.gst_number.input"
          />
          <p className="text-xs text-muted-foreground mt-1 font-body">
            Your 15-digit GST Identification Number
          </p>
        </div>

        {/* GST Percentage */}
        <div>
          <Label className="text-sm font-medium font-body">GST Rate (%)</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={gstForm.percentage}
            onChange={(e) =>
              setGstForm((f) => ({ ...f, percentage: e.target.value }))
            }
            placeholder="5"
            className="mt-1.5 max-w-[120px] h-11 rounded-xl"
            disabled={!gstForm.enabled}
            min={0}
            max={28}
            data-ocid="settings.gst_percentage.input"
          />
          <p className="text-xs text-muted-foreground mt-1 font-body">
            Common rates: 5%, 12%, 18%, 28%
          </p>
        </div>

        {/* Preview */}
        {gstForm.enabled && (
          <div className="bg-card border border-border rounded-xl p-3 text-sm space-y-1">
            <p className="font-medium text-foreground">Preview (₹100 order)</p>
            <div className="flex justify-between text-muted-foreground font-body">
              <span>Subtotal</span>
              <span>₹100.00</span>
            </div>
            <div className="flex justify-between text-muted-foreground font-body">
              <span>GST ({gstForm.percentage}%)</span>
              <span>
                ₹{(Number.parseFloat(gstForm.percentage) || 0).toFixed(2)}
              </span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>
                ₹
                {(100 + (Number.parseFloat(gstForm.percentage) || 0)).toFixed(
                  2,
                )}
              </span>
            </div>
          </div>
        )}

        <Button
          data-ocid="settings.save_button"
          className="w-full h-11 font-semibold bg-primary hover:bg-primary/90 rounded-xl gap-2"
          onClick={handleSaveGst}
        >
          <Check className="h-4 w-4" />
          Save GST Settings
        </Button>
      </div>
    </div>
  );
}

// ── MoneyManagementScreen ──────────────────────────────────────────────────────

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function MoneyManagementScreen({
  employees,
  allEmployees,
  salaryPayments,
  allSalaryPayments,
  branchId: _branchId,
  onUpdateEmployees,
  onUpdateSalaryPayments,
  onBack: _onBack,
}: {
  employees: Employee[];
  allEmployees: Employee[];
  salaryPayments: SalaryPayment[];
  allSalaryPayments: SalaryPayment[];
  branchId: number;
  onUpdateEmployees: (e: Employee[]) => void;
  onUpdateSalaryPayments: (sp: SalaryPayment[]) => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  // ── Pay Salary form state ──
  const [salaryForm, setSalaryForm] = useState({
    employeeId: "",
    month: `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`,
    date: todayStr(),
    amount: "",
    paymentMode: "Cash" as "Cash" | "Online",
  });

  // ── Pay Advance form state ──
  const [advanceForm, setAdvanceForm] = useState({
    employeeId: "",
    amount: "",
    date: todayStr(),
    paymentMode: "Cash" as "Cash" | "Online",
    notes: "",
  });

  // ── History filter ──
  const [historyEmpFilter, setHistoryEmpFilter] = useState("all");

  // ── Report state ──
  const [reportFrom, setReportFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [reportTo, setReportTo] = useState(todayStr());
  const [reportEmpFilter, setReportEmpFilter] = useState("all");
  const [reportGenerated, setReportGenerated] = useState(false);

  // ── Overview stats ──
  const today = todayStr();
  const currentMonthStr = `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`;

  const totalSalaryPaidToday = salaryPayments
    .filter((p) => p.type === "Salary" && p.date === today)
    .reduce((s, p) => s + p.amount, 0);

  const totalSalaryPaidThisMonth = salaryPayments
    .filter((p) => p.type === "Salary" && p.month === currentMonthStr)
    .reduce((s, p) => s + p.amount, 0);

  const totalAdvanceGiven = salaryPayments
    .filter((p) => p.type === "Advance")
    .reduce((s, p) => s + p.amount, 0);

  const pendingSalaryBalance = employees.reduce((sum, emp) => {
    const advTaken = totalAdvanceTaken(emp);
    const salPaid = totalSalaryPaid(emp.id, salaryPayments);
    const remaining = emp.salary - advTaken - salPaid;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  // ── Pay Salary submit ──
  function handleRecordSalary() {
    const emp = employees.find((e) => e.id === salaryForm.employeeId);
    if (!emp || !salaryForm.amount) return;
    const payment: SalaryPayment = {
      id: generateId(),
      employeeId: emp.id,
      type: "Salary",
      salaryType: emp.salaryType,
      month: emp.salaryType === "Monthly" ? salaryForm.month : undefined,
      amount: Number.parseFloat(salaryForm.amount),
      date: salaryForm.date,
      paymentMode: salaryForm.paymentMode,
      createdAt: Date.now(),
    };
    onUpdateSalaryPayments([...allSalaryPayments, payment]);
    toast.success(`Salary ₹${salaryForm.amount} recorded for ${emp.name}`);
    setSalaryForm((f) => ({ ...f, amount: "", employeeId: "" }));
  }

  // ── Pay Advance submit ──
  function handleRecordAdvance() {
    const emp = employees.find((e) => e.id === advanceForm.employeeId);
    if (!emp || !advanceForm.amount) return;
    const amt = Number.parseFloat(advanceForm.amount);

    // Add to SalaryPayment ledger
    const payment: SalaryPayment = {
      id: generateId(),
      employeeId: emp.id,
      type: "Advance",
      salaryType: emp.salaryType,
      amount: amt,
      date: advanceForm.date,
      paymentMode: advanceForm.paymentMode,
      notes: advanceForm.notes,
      createdAt: Date.now(),
    };
    onUpdateSalaryPayments([...allSalaryPayments, payment]);

    // Also add to employee.advances for backward compat
    const newAdvanceRecord: AdvanceRecord = {
      id: generateId(),
      amount: amt,
      date: advanceForm.date,
      reason: advanceForm.notes,
      createdAt: Date.now(),
    };
    onUpdateEmployees(
      allEmployees.map((e) =>
        e.id === emp.id
          ? { ...e, advances: [...e.advances, newAdvanceRecord] }
          : e,
      ),
    );

    toast.success(`Advance ₹${advanceForm.amount} recorded for ${emp.name}`);
    setAdvanceForm((f) => ({ ...f, amount: "", employeeId: "", notes: "" }));
  }

  // ── Report data ──
  const reportPayments = useMemo(() => {
    const from = new Date(reportFrom).getTime();
    const to = new Date(reportTo).getTime() + 86400000;
    return salaryPayments.filter((p) => {
      const ts = new Date(p.date).getTime();
      const matchDate = ts >= from && ts < to;
      const matchEmp =
        reportEmpFilter === "all" || p.employeeId === reportEmpFilter;
      return matchDate && matchEmp;
    });
  }, [salaryPayments, reportFrom, reportTo, reportEmpFilter]);

  // Build per-employee report rows
  const reportRows = useMemo(() => {
    const empMap = new Map<string, Employee>();
    for (const e of employees) empMap.set(e.id, e);

    const rows: {
      emp: Employee;
      salaryPaidInRange: number;
      advancePaidInRange: number;
      totalAdvance: number;
      remaining: number;
      payments: SalaryPayment[];
    }[] = [];

    const seenEmps = new Set<string>();
    for (const p of reportPayments) {
      seenEmps.add(p.employeeId);
    }

    for (const empId of seenEmps) {
      const emp = empMap.get(empId);
      if (!emp) continue;
      const empPayments = reportPayments.filter((p) => p.employeeId === empId);
      const salaryPaidInRange = empPayments
        .filter((p) => p.type === "Salary")
        .reduce((s, p) => s + p.amount, 0);
      const advancePaidInRange = empPayments
        .filter((p) => p.type === "Advance")
        .reduce((s, p) => s + p.amount, 0);
      const totalAdv = totalAdvanceTaken(emp);
      const totalSalPaid = totalSalaryPaid(emp.id, salaryPayments);
      const remaining = emp.salary - totalAdv - totalSalPaid;
      rows.push({
        emp,
        salaryPaidInRange,
        advancePaidInRange,
        totalAdvance: totalAdv,
        remaining,
        payments: empPayments,
      });
    }
    return rows;
  }, [reportPayments, employees, salaryPayments]);

  // ── CSV Download ──
  function downloadCSV() {
    const headers = [
      "Employee Name",
      "Salary Type",
      "Salary Amount",
      "Payment Type",
      "Amount",
      "Month",
      "Payment Date",
      "Payment Mode",
      "Notes",
    ];
    const rows: string[][] = [];
    for (const p of reportPayments) {
      const emp = employees.find((e) => e.id === p.employeeId);
      if (!emp) continue;
      rows.push([
        emp.name,
        emp.salaryType,
        String(emp.salary),
        p.type,
        String(p.amount),
        p.month ?? "",
        p.date,
        p.paymentMode,
        p.notes ?? "",
      ]);
    }
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salary-report-${reportFrom}-to-${reportTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Print / PDF ──
  function downloadPDF() {
    window.print();
  }

  // ── History list ──
  const historyPayments = useMemo(() => {
    const list =
      historyEmpFilter === "all"
        ? salaryPayments
        : salaryPayments.filter((p) => p.employeeId === historyEmpFilter);
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [salaryPayments, historyEmpFilter]);

  const selectedSalaryEmp = employees.find(
    (e) => e.id === salaryForm.employeeId,
  );
  const selectedAdvanceEmp = employees.find(
    (e) => e.id === advanceForm.employeeId,
  );

  // Live balance preview for advance
  const advancePreviewBalance = selectedAdvanceEmp
    ? selectedAdvanceEmp.salary -
      totalAdvanceTaken(selectedAdvanceEmp) -
      totalSalaryPaid(selectedAdvanceEmp.id, salaryPayments) -
      (Number.parseFloat(advanceForm.amount) || 0)
    : null;

  return (
    <div
      className="max-w-4xl mx-auto p-4 space-y-5"
      data-ocid="money_mgmt.page"
    >
      <div className="flex items-center gap-3">
        <h2 className="font-display text-2xl font-bold">Money Management</h2>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        data-ocid="money_mgmt.tab"
      >
        <TabsList className="grid grid-cols-5 w-full rounded-xl h-auto">
          <TabsTrigger
            value="overview"
            data-ocid="money_mgmt.overview_tab"
            className="rounded-lg text-xs sm:text-sm py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="pay-salary"
            data-ocid="money_mgmt.pay_salary_tab"
            className="rounded-lg text-xs sm:text-sm py-2"
          >
            Pay Salary
          </TabsTrigger>
          <TabsTrigger
            value="pay-advance"
            data-ocid="money_mgmt.pay_advance_tab"
            className="rounded-lg text-xs sm:text-sm py-2"
          >
            Advance
          </TabsTrigger>
          <TabsTrigger
            value="history"
            data-ocid="money_mgmt.history_tab"
            className="rounded-lg text-xs sm:text-sm py-2"
          >
            History
          </TabsTrigger>
          <TabsTrigger
            value="report"
            data-ocid="money_mgmt.report_tab"
            className="rounded-lg text-xs sm:text-sm py-2"
          >
            Report
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Overview ── */}
        <TabsContent value="overview" className="space-y-5 mt-4">
          {/* Stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3"
            data-ocid="money_mgmt.stats_section"
          >
            <div
              className="pos-card p-4 text-center"
              data-ocid="money_mgmt.total_employees.card"
            >
              <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center bg-primary/15">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xl font-bold font-display text-primary">
                {employees.length}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Total Employees
              </p>
            </div>
            <div
              className="pos-card p-4 text-center"
              data-ocid="money_mgmt.today_salary.card"
            >
              <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center bg-primary/15">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xl font-bold font-display text-primary">
                ₹{totalSalaryPaidToday.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Paid Today
              </p>
            </div>
            <div
              className="pos-card p-4 text-center"
              data-ocid="money_mgmt.month_salary.card"
            >
              <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center bg-primary/15">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xl font-bold font-display text-primary">
                ₹{totalSalaryPaidThisMonth.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Paid This Month
              </p>
            </div>
            <div
              className="pos-card p-4 text-center"
              data-ocid="money_mgmt.advance_given.card"
            >
              <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center bg-accent/15">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
              <p className="text-xl font-bold font-display text-accent">
                ₹{totalAdvanceGiven.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Total Advance
              </p>
            </div>
            <div
              className="pos-card p-4 text-center"
              data-ocid="money_mgmt.pending_balance.card"
            >
              <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center bg-destructive/15">
                <Clock className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-xl font-bold font-display text-destructive">
                ₹{pendingSalaryBalance.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Pending Balance
              </p>
            </div>
          </div>

          {/* Employee salary table */}
          {employees.length === 0 ? (
            <div
              className="pos-card p-12 text-center text-muted-foreground"
              data-ocid="money_mgmt.employees_table.empty_state"
            >
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No employees in this branch</p>
            </div>
          ) : (
            <div
              className="pos-card overflow-hidden"
              data-ocid="money_mgmt.employees_table"
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-sm">
                  Employee Salary Overview
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Employee
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Type
                      </th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Salary
                      </th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Advance
                      </th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Paid
                      </th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Remaining
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, idx) => {
                      const advTaken = totalAdvanceTaken(emp);
                      const salPaid = totalSalaryPaid(emp.id, salaryPayments);
                      const remaining = emp.salary - advTaken - salPaid;
                      const isPaid = remaining <= 0;
                      return (
                        <tr
                          key={emp.id}
                          data-ocid={`money_mgmt.employee_row.${idx + 1}`}
                          className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-foreground">
                              {emp.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {emp.employeeId}
                            </p>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${emp.salaryType === "Monthly" ? "bg-blue-900/40 text-blue-300 border-blue-700/40" : "bg-orange-900/40 text-orange-300 border-orange-700/40"}`}
                            >
                              {emp.salaryType}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-primary">
                            ₹{emp.salary.toLocaleString("en-IN")}
                          </td>
                          <td className="px-3 py-3 text-right text-accent font-semibold">
                            {advTaken > 0
                              ? `−₹${advTaken.toLocaleString("en-IN")}`
                              : "—"}
                          </td>
                          <td className="px-3 py-3 text-right text-primary font-semibold">
                            {salPaid > 0
                              ? `₹${salPaid.toLocaleString("en-IN")}`
                              : "—"}
                          </td>
                          <td className="px-3 py-3 text-right font-bold">
                            <span
                              className={
                                remaining <= 0 ? "text-primary" : "text-accent"
                              }
                            >
                              ₹{Math.max(remaining, 0).toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${isPaid ? "bg-green-900/50 text-green-300 border-green-700/50" : "bg-orange-900/50 text-orange-300 border-orange-700/50"}`}
                            >
                              {isPaid ? "Paid" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Tab 2: Pay Salary ── */}
        <TabsContent value="pay-salary" className="space-y-5 mt-4">
          <div
            className="pos-card p-5 space-y-5 max-w-lg mx-auto"
            data-ocid="money_mgmt.pay_salary.card"
          >
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-base">
                  Record Salary Payment
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  Track salary paid to employee
                </p>
              </div>
            </div>

            {/* Employee */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Employee <span className="text-destructive">*</span>
              </Label>
              <Select
                value={salaryForm.employeeId}
                onValueChange={(v) => {
                  const emp = employees.find((e) => e.id === v);
                  setSalaryForm((f) => ({
                    ...f,
                    employeeId: v,
                    amount: emp ? String(emp.salary) : "",
                  }));
                }}
              >
                <SelectTrigger
                  className="mt-1.5 h-11 rounded-xl"
                  data-ocid="money_mgmt.salary_employee.select"
                >
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.salaryType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month (Monthly only) */}
            {selectedSalaryEmp?.salaryType === "Monthly" && (
              <div>
                <Label className="text-sm font-body font-medium text-foreground">
                  Month
                </Label>
                <Select
                  value={salaryForm.month}
                  onValueChange={(v) =>
                    setSalaryForm((f) => ({ ...f, month: v }))
                  }
                >
                  <SelectTrigger
                    className="mt-1.5 h-11 rounded-xl"
                    data-ocid="money_mgmt.salary_month.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem
                        key={m}
                        value={`${m} ${new Date().getFullYear()}`}
                      >
                        {m} {new Date().getFullYear()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Payment Date */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Payment Date
              </Label>
              <Input
                type="date"
                value={salaryForm.date}
                onChange={(e) =>
                  setSalaryForm((f) => ({ ...f, date: e.target.value }))
                }
                className="mt-1.5 h-11 rounded-xl"
                data-ocid="money_mgmt.salary_date.input"
              />
            </div>

            {/* Amount */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                inputMode="numeric"
                value={salaryForm.amount}
                onChange={(e) =>
                  setSalaryForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder={
                  selectedSalaryEmp ? `e.g. ${selectedSalaryEmp.salary}` : "0"
                }
                className="mt-1.5 h-11 rounded-xl"
                data-ocid="money_mgmt.salary_amount.input"
              />
            </div>

            {/* Payment Mode */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground mb-2 block">
                Payment Mode
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {(["Cash", "Online"] as const).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    data-ocid={`money_mgmt.salary_mode_${mode.toLowerCase()}.toggle`}
                    onClick={() =>
                      setSalaryForm((f) => ({ ...f, paymentMode: mode }))
                    }
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${salaryForm.paymentMode === mode ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"}`}
                  >
                    {mode === "Cash" ? (
                      <Banknote className="h-4 w-4" />
                    ) : (
                      <QrCode className="h-4 w-4" />
                    )}
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Balance preview */}
            {selectedSalaryEmp && salaryForm.amount && (
              <div className="bg-primary/8 border border-primary/20 rounded-xl p-4 space-y-2 text-sm font-body">
                <div className="flex justify-between text-muted-foreground">
                  <span>{selectedSalaryEmp.salaryType} Salary</span>
                  <span className="font-semibold text-foreground">
                    ₹{selectedSalaryEmp.salary.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-accent">
                  <span>Total Advance</span>
                  <span>
                    −₹
                    {totalAdvanceTaken(selectedSalaryEmp).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>This Payment</span>
                  <span>
                    −₹
                    {(Number.parseFloat(salaryForm.amount) || 0).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Remaining</span>
                  <span
                    className={
                      selectedSalaryEmp.salary -
                        totalAdvanceTaken(selectedSalaryEmp) -
                        totalSalaryPaid(selectedSalaryEmp.id, salaryPayments) -
                        (Number.parseFloat(salaryForm.amount) || 0) >=
                      0
                        ? "text-primary"
                        : "text-destructive"
                    }
                  >
                    ₹
                    {(
                      selectedSalaryEmp.salary -
                      totalAdvanceTaken(selectedSalaryEmp) -
                      totalSalaryPaid(selectedSalaryEmp.id, salaryPayments) -
                      (Number.parseFloat(salaryForm.amount) || 0)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            <Button
              data-ocid="money_mgmt.record_salary.submit_button"
              className="w-full h-12 font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground glow-btn gap-2"
              disabled={!salaryForm.employeeId || !salaryForm.amount}
              onClick={handleRecordSalary}
            >
              <Check className="h-5 w-5" />
              Record Salary Payment
            </Button>
          </div>
        </TabsContent>

        {/* ── Tab 3: Pay Advance ── */}
        <TabsContent value="pay-advance" className="space-y-5 mt-4">
          <div
            className="pos-card p-5 space-y-5 max-w-lg mx-auto"
            data-ocid="money_mgmt.pay_advance.card"
          >
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-display font-bold text-base">
                  Record Advance Payment
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  Track advance given to employee
                </p>
              </div>
            </div>

            {/* Employee */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Employee <span className="text-destructive">*</span>
              </Label>
              <Select
                value={advanceForm.employeeId}
                onValueChange={(v) =>
                  setAdvanceForm((f) => ({ ...f, employeeId: v }))
                }
              >
                <SelectTrigger
                  className="mt-1.5 h-11 rounded-xl"
                  data-ocid="money_mgmt.advance_employee.select"
                >
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.salaryType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advance Amount */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Advance Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                inputMode="numeric"
                value={advanceForm.amount}
                onChange={(e) =>
                  setAdvanceForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="e.g. 2000"
                className="mt-1.5 h-11 rounded-xl"
                data-ocid="money_mgmt.advance_amount.input"
              />
            </div>

            {/* Date */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Advance Date
              </Label>
              <Input
                type="date"
                value={advanceForm.date}
                onChange={(e) =>
                  setAdvanceForm((f) => ({ ...f, date: e.target.value }))
                }
                className="mt-1.5 h-11 rounded-xl"
                data-ocid="money_mgmt.advance_date.input"
              />
            </div>

            {/* Payment Mode */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground mb-2 block">
                Payment Mode
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {(["Cash", "Online"] as const).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    data-ocid={`money_mgmt.advance_mode_${mode.toLowerCase()}.toggle`}
                    onClick={() =>
                      setAdvanceForm((f) => ({ ...f, paymentMode: mode }))
                    }
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${advanceForm.paymentMode === mode ? "border-accent bg-accent/20 text-accent" : "border-border bg-card text-foreground hover:border-accent/50"}`}
                  >
                    {mode === "Cash" ? (
                      <Banknote className="h-4 w-4" />
                    ) : (
                      <QrCode className="h-4 w-4" />
                    )}
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm font-body font-medium text-foreground">
                Notes{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                value={advanceForm.notes}
                onChange={(e) =>
                  setAdvanceForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="e.g. Medical emergency, Festival advance"
                rows={2}
                className="mt-1.5 rounded-xl resize-none"
                data-ocid="money_mgmt.advance_notes.textarea"
              />
            </div>

            {/* Live balance preview */}
            {selectedAdvanceEmp && advanceForm.amount && (
              <div className="bg-accent/8 border border-accent/20 rounded-xl p-4 space-y-2 text-sm font-body">
                <div className="flex justify-between text-muted-foreground">
                  <span>{selectedAdvanceEmp.salaryType} Salary</span>
                  <span className="font-semibold text-foreground">
                    ₹{selectedAdvanceEmp.salary.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Total Advance So Far</span>
                  <span>
                    −₹
                    {totalAdvanceTaken(selectedAdvanceEmp).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>New Advance</span>
                  <span>
                    −₹
                    {(
                      Number.parseFloat(advanceForm.amount) || 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Balance After</span>
                  <span
                    className={
                      advancePreviewBalance !== null &&
                      advancePreviewBalance >= 0
                        ? "text-primary"
                        : "text-destructive"
                    }
                  >
                    ₹{(advancePreviewBalance ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            <Button
              data-ocid="money_mgmt.record_advance.submit_button"
              className="w-full h-12 font-semibold rounded-xl gap-2"
              style={{ background: "#FF7A45", color: "white" }}
              disabled={!advanceForm.employeeId || !advanceForm.amount}
              onClick={handleRecordAdvance}
            >
              <Wallet className="h-5 w-5" />
              Record Advance
            </Button>
          </div>
        </TabsContent>

        {/* ── Tab 4: History ── */}
        <TabsContent value="history" className="space-y-4 mt-4">
          {/* Employee filter */}
          <div className="flex items-center gap-3">
            <Label className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              Employee:
            </Label>
            <Select
              value={historyEmpFilter}
              onValueChange={setHistoryEmpFilter}
            >
              <SelectTrigger
                className="h-9 rounded-xl flex-1 max-w-xs"
                data-ocid="money_mgmt.history_filter.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {historyPayments.length === 0 ? (
            <div
              className="pos-card p-12 text-center text-muted-foreground"
              data-ocid="money_mgmt.history.empty_state"
            >
              <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No payment records</p>
              <p className="text-sm mt-1 opacity-70">
                Record salary or advance payments to see history here
              </p>
            </div>
          ) : (
            <div className="space-y-2" data-ocid="money_mgmt.history.list">
              {historyPayments.map((p, idx) => {
                const emp = employees.find((e) => e.id === p.employeeId);
                return (
                  <div
                    key={p.id}
                    data-ocid={`money_mgmt.history.item.${idx + 1}`}
                    className="pos-card p-4 flex items-start gap-4"
                  >
                    {/* Type indicator */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${p.type === "Salary" ? "bg-green-900/40" : "bg-red-900/40"}`}
                    >
                      {p.type === "Salary" ? (
                        <IndianRupee className="h-4 w-4 text-green-300" />
                      ) : (
                        <Wallet className="h-4 w-4 text-red-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">
                          {emp?.name ?? "Unknown"}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${p.type === "Salary" ? "bg-green-900/50 text-green-300 border-green-700/50" : "bg-red-900/50 text-red-300 border-red-700/50"}`}
                        >
                          {p.type}
                        </span>
                        <span className="text-xs text-muted-foreground border border-border/50 px-1.5 py-0.5 rounded">
                          {p.paymentMode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground font-body">
                          {formatDate(p.date)}
                          {p.type === "Salary" && p.month && ` · ${p.month}`}
                        </span>
                      </div>
                      {p.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic font-body">
                          {p.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-bold text-sm ${p.type === "Salary" ? "text-primary" : "text-destructive"}`}
                      >
                        {p.type === "Salary" ? "+" : "−"}₹
                        {p.amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 5: Report ── */}
        <TabsContent value="report" className="space-y-5 mt-4">
          {/* Filters */}
          <div
            className="pos-card p-4 space-y-4"
            data-ocid="money_mgmt.report_filters.card"
          >
            <p className="font-semibold text-sm">Report Filters</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={reportFrom}
                  onChange={(e) => setReportFrom(e.target.value)}
                  className="mt-1 h-10"
                  data-ocid="money_mgmt.report_from.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={reportTo}
                  onChange={(e) => setReportTo(e.target.value)}
                  className="mt-1 h-10"
                  data-ocid="money_mgmt.report_to.input"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Employee</Label>
              <Select
                value={reportEmpFilter}
                onValueChange={setReportEmpFilter}
              >
                <SelectTrigger
                  className="mt-1 h-10 rounded-xl"
                  data-ocid="money_mgmt.report_emp_filter.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              data-ocid="money_mgmt.generate_report.button"
              className="w-full h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={() => setReportGenerated(true)}
            >
              <TrendingUp className="h-4 w-4" />
              Generate Report
            </Button>
          </div>

          {/* Report table */}
          {reportGenerated && (
            <>
              {/* Download buttons */}
              <div className="flex gap-3">
                <Button
                  data-ocid="money_mgmt.download_csv.button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl font-semibold border-primary text-primary gap-2"
                  onClick={downloadCSV}
                >
                  <TrendingUp className="h-4 w-4" />
                  Download CSV
                </Button>
                <Button
                  data-ocid="money_mgmt.download_pdf.button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl font-semibold border-accent text-accent gap-2"
                  onClick={downloadPDF}
                >
                  <Printer className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>

              {reportPayments.length === 0 ? (
                <div
                  className="pos-card p-12 text-center text-muted-foreground"
                  data-ocid="money_mgmt.report.empty_state"
                >
                  <BarChart2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No payments found for selected filters</p>
                </div>
              ) : (
                <>
                  {/* Summary per employee */}
                  <div className="space-y-3" data-ocid="money_mgmt.report.list">
                    {reportRows.map((row, idx) => (
                      <div
                        key={row.emp.id}
                        data-ocid={`money_mgmt.report_row.${idx + 1}`}
                        className="pos-card overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">
                              {row.emp.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {row.emp.employeeId} · {row.emp.salaryType} Salary
                              · ₹{row.emp.salary.toLocaleString("en-IN")}/month
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${row.remaining <= 0 ? "bg-green-900/50 text-green-300 border-green-700/50" : "bg-orange-900/50 text-orange-300 border-orange-700/50"}`}
                          >
                            {row.remaining <= 0 ? "Paid" : "Pending"}
                          </span>
                        </div>
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Total Advance
                            </p>
                            <p className="font-bold text-accent">
                              ₹{row.totalAdvance.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Salary Paid
                            </p>
                            <p className="font-bold text-primary">
                              ₹{row.salaryPaidInRange.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Advance (Period)
                            </p>
                            <p className="font-bold text-destructive">
                              ₹{row.advancePaidInRange.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Remaining
                            </p>
                            <p
                              className={`font-bold ${row.remaining <= 0 ? "text-primary" : "text-accent"}`}
                            >
                              ₹
                              {Math.max(row.remaining, 0).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>
                        </div>
                        {/* Payment rows */}
                        <div className="px-4 pb-3 space-y-1.5">
                          {row.payments.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between text-xs font-body bg-secondary/30 rounded-lg px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded font-semibold ${p.type === "Salary" ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}`}
                                >
                                  {p.type}
                                </span>
                                <span className="text-muted-foreground">
                                  {formatDate(p.date)}
                                </span>
                                {p.month && (
                                  <span className="text-muted-foreground">
                                    · {p.month}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground">
                                  {p.paymentMode}
                                </span>
                                <span
                                  className={`font-bold ${p.type === "Salary" ? "text-primary" : "text-destructive"}`}
                                >
                                  ₹{p.amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Print-only area */}
                  <div
                    id="money-report-print-area"
                    className="hidden print:block font-mono text-xs p-4"
                  >
                    <h1 className="font-bold text-lg mb-2">
                      Gobinath Hotel – Salary Report
                    </h1>
                    <p className="mb-1">
                      Period: {reportFrom} to {reportTo}
                    </p>
                    <p className="mb-4">
                      Generated: {new Date().toLocaleDateString("en-IN")}
                    </p>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-black px-2 py-1 text-left">
                            Employee
                          </th>
                          <th className="border border-black px-2 py-1">
                            Type
                          </th>
                          <th className="border border-black px-2 py-1">
                            Salary
                          </th>
                          <th className="border border-black px-2 py-1">
                            Advance
                          </th>
                          <th className="border border-black px-2 py-1">
                            Paid
                          </th>
                          <th className="border border-black px-2 py-1">
                            Remaining
                          </th>
                          <th className="border border-black px-2 py-1">
                            Mode
                          </th>
                          <th className="border border-black px-2 py-1">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportPayments.map((p) => {
                          const emp = employees.find(
                            (e) => e.id === p.employeeId,
                          );
                          const advTaken = emp ? totalAdvanceTaken(emp) : 0;
                          const salPaid = emp
                            ? totalSalaryPaid(emp.id, salaryPayments)
                            : 0;
                          const rem = emp ? emp.salary - advTaken - salPaid : 0;
                          return (
                            <tr key={p.id}>
                              <td className="border border-black px-2 py-1">
                                {emp?.name}
                              </td>
                              <td className="border border-black px-2 py-1 text-center">
                                {p.type}
                              </td>
                              <td className="border border-black px-2 py-1 text-right">
                                ₹{emp?.salary.toLocaleString("en-IN")}
                              </td>
                              <td className="border border-black px-2 py-1 text-right">
                                ₹{advTaken.toLocaleString("en-IN")}
                              </td>
                              <td className="border border-black px-2 py-1 text-right">
                                ₹{salPaid.toLocaleString("en-IN")}
                              </td>
                              <td className="border border-black px-2 py-1 text-right">
                                ₹{Math.max(rem, 0).toLocaleString("en-IN")}
                              </td>
                              <td className="border border-black px-2 py-1 text-center">
                                {p.paymentMode}
                              </td>
                              <td className="border border-black px-2 py-1">
                                {p.date}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
