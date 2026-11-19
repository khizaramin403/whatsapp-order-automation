"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ClipboardList,
  ChefHat,
  Bike,
  UtensilsCrossed,
  ChartColumn,
  Users,
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Languages,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Clock,
  Banknote,
  Smartphone,
  Image as ImageIcon,
  CircleCheck,
  TriangleAlert,
  CircleAlert,
  Info,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

import { BRAND_NAME } from "@/config/brand";
import { LanguageSwitcherTest } from "@/components/LanguageSwitcherTest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/components/ui/sonner";

// Core colors from DESIGN.md Section 7.2
const CORE_COLORS = [
  { name: "Midnight Blue", hex: "#10202D", use: "Sidebar, primary buttons, headings, main text", lightText: true },
  { name: "Muted Gold", hex: "#C7A667", use: "Accent: active marker, key button, badge on dark", lightText: false },
  { name: "Soft White", hex: "#F7F7F7", use: "Page background, text on dark", border: true, lightText: false },
  { name: "White", hex: "#FFFFFF", use: "Cards, topbar, tables, inputs", border: true, lightText: false },
  { name: "Midnight 800", hex: "#1B2D3B", use: "Sidebar hover and active background", lightText: true },
  { name: "Midnight 700", hex: "#22394B", use: "Sidebar borders, avatar fallback on dark", lightText: true },
  { name: "Midnight Deep", hex: "#0B1620", use: "Tooltips", lightText: true },
  { name: "Slate Text", hex: "#4A5865", use: "Secondary text", lightText: true },
  { name: "Muted Text", hex: "#5F6C79", use: "Labels, captions, placeholders", lightText: true },
  { name: "Sidebar Text", hex: "#A9B4BE", use: "Inactive sidebar labels and icons", lightText: false },
  { name: "Border", hex: "#E2E5E9", use: "Card and table borders", border: true, lightText: false },
  { name: "Input Border", hex: "#D5DAE0", use: "Inputs and secondary buttons", border: true, lightText: false },
  { name: "Hover Fill", hex: "#F2F4F6", use: "Row, menu and ghost button hover on light", border: true, lightText: false },
  { name: "Gold Tint", hex: "#F4ECDC", use: "Selected row, soft highlight, avatar fallback on light", border: true, lightText: false },
  { name: "Gold Text", hex: "#7D6228", use: "Links and gold-colored text on light backgrounds", lightText: true },
  { name: "Gold Hover", hex: "#B5964F", use: "Gold button hover", lightText: false },
  { name: "Gold Pressed", hex: "#A3853F", use: "Gold button pressed", lightText: false },
];

// Status color pairs from DESIGN.md Section 7.2
type StatusKey = "success" | "warning" | "danger" | "info" | "gold" | "midnight" | "neutral";

const STATUS_COLORS: Array<{
  key: StatusKey;
  name: string;
  fill: string;
  text: string;
  solid: string;
  desc: string;
}> = [
  { key: "success", name: "Success", fill: "#E6F2EC", text: "#1F5C42", solid: "#2F7D5B", desc: "Ready, payment verified" },
  { key: "warning", name: "Warning", fill: "#FBF0DA", text: "#7A4E0B", solid: "#B7791F", desc: "Pending, payment awaiting check" },
  { key: "danger", name: "Danger", fill: "#F8E4E1", text: "#8E2A22", solid: "#B3392F", desc: "Rejected, cancelled, errors" },
  { key: "info", name: "Info", fill: "#E3EDF5", text: "#1F4C73", solid: "#2F6690", desc: "Preparing, informational notes" },
  { key: "gold", name: "Gold (Accepted)", fill: "#F4ECDC", text: "#7D6228", solid: "#C7A667", desc: "Accepted" },
  { key: "midnight", name: "Midnight Tint", fill: "#E3E8EE", text: "#10202D", solid: "#10202D", desc: "Out for delivery" },
  { key: "neutral", name: "Neutral", fill: "#ECEEF1", text: "#3A4651", solid: "#5F6C79", desc: "Delivered (history), COD tag, inactive" },
];

// Chart mock data from DESIGN.md Section 7.14
const HOURLY_ORDERS = [
  { hour: "12pm", orders: 14, isPeak: false },
  { hour: "1pm", orders: 28, isPeak: false },
  { hour: "2pm", orders: 42, isPeak: true }, // Peak bar in gold
  { hour: "3pm", orders: 19, isPeak: false },
  { hour: "4pm", orders: 11, isPeak: false },
  { hour: "5pm", orders: 18, isPeak: false },
  { hour: "6pm", orders: 34, isPeak: false },
  { hour: "7pm", orders: 38, isPeak: false },
];

const SALES_TIMELINE = [
  { day: "Mon", sales: 14000 },
  { day: "Tue", sales: 22000 },
  { day: "Wed", sales: 18000 },
  { day: "Thu", sales: 29000 },
  { day: "Fri", sales: 42000 },
  { day: "Sat", sales: 51000 },
  { day: "Sun", sales: 47000 },
];

const PAYMENT_BREAKDOWN = [
  { name: "Cash on Delivery (65%)", value: 65, color: "#10202D" },
  { name: "Online Payment (35%)", value: 35, color: "#C7A667" },
];

export default function DesignCheckPage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [persistentAlert, setPersistentAlert] = React.useState(true);
  const [passwordShown, setPasswordShown] = React.useState(false);

  // Icon set mapping from DESIGN.md Section 7.11
  const iconSet = [
    { name: "ClipboardList", icon: ClipboardList, label: "Orders" },
    { name: "ChefHat", icon: ChefHat, label: "Kitchen" },
    { name: "Bike", icon: Bike, label: "Delivery" },
    { name: "UtensilsCrossed", icon: UtensilsCrossed, label: "Menu" },
    { name: "ChartColumn", icon: ChartColumn, label: "Analytics" },
    { name: "Users", icon: Users, label: "Team" },
    { name: "Settings", icon: Settings, label: "Settings" },
    { name: "Bell", icon: Bell, label: "Notifications" },
    { name: "Volume2", icon: Volume2, label: "Sound On" },
    { name: "VolumeX", icon: VolumeX, label: "Sound Muted" },
    { name: "Languages", icon: Languages, label: "Language" },
    { name: "PanelLeftClose", icon: PanelLeftClose, label: "Sidebar Close" },
    { name: "PanelLeftOpen", icon: PanelLeftOpen, label: "Sidebar Open" },
    { name: "LogOut", icon: LogOut, label: "Sign out" },
    { name: "Eye", icon: Eye, label: "Password Show" },
    { name: "EyeOff", icon: EyeOff, label: "Password Hide" },
    { name: "Phone", icon: Phone, label: "Phone" },
    { name: "MapPin", icon: MapPin, label: "Address" },
    { name: "Clock", icon: Clock, label: "Time" },
    { name: "Banknote", icon: Banknote, label: "COD Payment" },
    { name: "Smartphone", icon: Smartphone, label: "Online Payment" },
    { name: "ImageIcon", icon: ImageIcon, label: "Screenshot" },
    { name: "CircleCheck", icon: CircleCheck, label: "Success" },
    { name: "TriangleAlert", icon: TriangleAlert, label: "Warning" },
    { name: "CircleAlert", icon: CircleAlert, label: "Error" },
    { name: "Info", icon: Info, label: "Info" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#10202D] p-6 sm:p-10 max-w-7xl mx-auto space-y-12">
      {/* Top Header */}
      <header className="border-b border-[#E2E5E9] pb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-brand text-3xl font-semibold text-[#10202D]">
                {BRAND_NAME}
              </span>
              <Badge variant="accent" className="font-mono text-xs">
                /design-check
              </Badge>
            </div>
            <p className="text-sm text-[#5F6C79] mt-1">
              Step 1.4: Complete UI Component &amp; State Verification against docs/design (Pages 7-14)
            </p>
          </div>
          <LanguageSwitcherTest />
        </div>

        {/* Locale & RTL Indicators */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#5F6C79] bg-white p-3 rounded-[8px] border border-[#E2E5E9]">
          <span>Current Lang: <strong className="font-mono text-[#10202D]">{locale}</strong></span>
          <span>&bull;</span>
          <span>Direction: <strong className="font-mono text-[#10202D]">{isRtl ? "RTL (Right-to-Left)" : "LTR (Left-to-Right)"}</strong></span>
          <span>&bull;</span>
          <span>Font: <strong className="font-mono text-[#10202D]">{isRtl ? "IBM Plex Sans Arabic" : "Inter"}</strong></span>
          <span>&bull;</span>
          <span>Brand Serif: <strong className="font-brand text-[#10202D]">Playfair Display 600</strong></span>
          <span>&bull;</span>
          <span>Sample Keys: <strong className="text-[#10202D]">{t("orders")} / {t("kitchen")} / {t("save")}</strong></span>
        </div>
      </header>

      {/* 1. Color Palette Section */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <div>
          <h2 className="text-section-title">1. Color Palette (DESIGN.md Section 7.2)</h2>
          <p className="text-caption mt-1">Proportion: 60% Soft White &amp; White, 30% Midnight Blue, 10% Muted Gold accent</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CORE_COLORS.map((c) => (
            <div
              key={c.hex}
              className={`p-3 rounded-[8px] flex flex-col justify-between h-28 ${c.border ? "border border-[#E2E5E9]" : ""}`}
              style={{ backgroundColor: c.hex }}
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold text-xs" style={{ color: c.lightText ? "#F7F7F7" : "#10202D" }}>
                  {c.name}
                </span>
                <span
                  className="font-mono text-[10px] px-1 rounded"
                  style={{
                    backgroundColor: c.lightText ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
                    color: c.lightText ? "#F7F7F7" : "#10202D",
                  }}
                >
                  {c.hex}
                </span>
              </div>
              <p className="text-[10px] leading-tight opacity-90 line-clamp-2" style={{ color: c.lightText ? "#A9B4BE" : "#5F6C79" }}>
                {c.use}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Type Scale Section */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <h2 className="text-section-title">2. Type Scale (DESIGN.md Section 7.4)</h2>
        <div className="divide-y divide-[#E2E5E9] space-y-3">
          <div className="pt-2">
            <span className="text-caption block mb-1">Login heading &bull; Playfair Display 34 / 40 &bull; Weight 600</span>
            <p className="text-login-heading">Welcome back to {BRAND_NAME}</p>
          </div>
          <div className="pt-3">
            <span className="text-caption block mb-1">Page title &bull; 24 / 32 &bull; Weight 600 &bull; #10202D</span>
            <p className="text-page-title">Operations &amp; Kitchen Flow</p>
          </div>
          <div className="pt-3">
            <span className="text-caption block mb-1">Section title &bull; 18 / 28 &bull; Weight 600 &bull; #10202D</span>
            <p className="text-section-title">Active Orders Overview</p>
          </div>
          <div className="pt-3">
            <span className="text-caption block mb-1">Card title &bull; 16 / 24 &bull; Weight 600 &bull; #10202D</span>
            <p className="text-card-title">Order #1042 - 2x Biryani, 1x Raita</p>
          </div>
          <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-caption block mb-1">Body text primary &bull; 14 / 20 &bull; Weight 400 &bull; #10202D</span>
              <p className="text-body-primary">Order confirmed via WhatsApp. Customer specified no spicy ingredients.</p>
            </div>
            <div>
              <span className="text-caption block mb-1">Body text secondary &bull; 14 / 20 &bull; Weight 400 &bull; #4A5865</span>
              <p className="text-body-secondary">Assigned to rider Ali Raza. Destination: Block 4, Clifton.</p>
            </div>
          </div>
          <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-caption block mb-1">Form label &bull; 13 / 18 &bull; Weight 500 &bull; #10202D</span>
              <p className="text-form-label">Customer Mobile Number *</p>
            </div>
            <div>
              <span className="text-caption block mb-1">Caption &amp; helper &bull; 12 / 16 &bull; Weight 400 &bull; #5F6C79</span>
              <p className="text-caption">Enter digits only with international dial code (+92)</p>
            </div>
          </div>
          <div className="pt-3">
            <span className="text-caption block mb-1">Table header &bull; 12 / 16 &bull; Uppercase, letter-spacing 0.04em &bull; Weight 600 &bull; #5F6C79</span>
            <p className="text-table-header">ORDER ID &bull; CUSTOMER &bull; ITEMS &bull; TOTAL &bull; STATUS &bull; CREATED</p>
          </div>
          <div className="pt-3">
            <span className="text-caption block mb-1">KPI number &bull; 28 / 36 &bull; Weight 600 &bull; Tabular Numerals</span>
            <p className="text-kpi-number tabular-nums">Rs 148,250.00</p>
          </div>
        </div>
      </section>

      {/* 3. Button Variants & States (DESIGN.md Section 7.7) */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-6">
        <div>
          <h2 className="text-section-title">3. Buttons: All 5 Variants &amp; States (DESIGN.md Section 7.7)</h2>
          <p className="text-caption mt-1">
            Exact colors, 40px default height, 8px radius, 14px font weight 600, 150ms transitions. Focus ring: 2px with 2px offset.
          </p>
        </div>

        {/* State comparison grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border border-[#E2E5E9] rounded-[8px] overflow-hidden">
            <thead className="bg-[#F7F7F7] border-b border-[#E2E5E9]">
              <tr>
                <th className="p-3 text-start font-semibold text-[#5F6C79]">Variant</th>
                <th className="p-3 text-start font-semibold text-[#5F6C79]">Default</th>
                <th className="p-3 text-start font-semibold text-[#5F6C79]">Hover (Demo)</th>
                <th className="p-3 text-start font-semibold text-[#5F6C79]">Pressed (Demo)</th>
                <th className="p-3 text-start font-semibold text-[#5F6C79]">Focus (Demo)</th>
                <th className="p-3 text-start font-semibold text-[#5F6C79]">Disabled</th>
                <th className="p-3 text-start font-semibold text-[#5F6C79]">Loading</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5E9] bg-white">
              {/* Primary */}
              <tr>
                <td className="p-3 font-semibold text-[#10202D]">Primary (#10202D)</td>
                <td className="p-3"><Button variant="primary">Sign in</Button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#1B3345] text-[#F7F7F7]">Sign in</button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#0B1620] text-[#F7F7F7]">Sign in</button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#10202D] text-[#F7F7F7] ring-2 ring-[#10202D] ring-offset-2">Sign in</button></td>
                <td className="p-3"><Button variant="primary" disabled>Sign in</Button></td>
                <td className="p-3"><Button variant="primary" loading>Sign in</Button></td>
              </tr>
              {/* Accent (Gold) */}
              <tr>
                <td className="p-3 font-semibold text-[#7D6228]">Accent Gold (#C7A667)</td>
                <td className="p-3"><Button variant="accent">Accept order</Button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#B5964F] text-[#10202D]">Accept order</button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#A3853F] text-[#10202D]">Accept order</button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#C7A667] text-[#10202D] ring-2 ring-[#C7A667] ring-offset-2">Accept order</button></td>
                <td className="p-3"><Button variant="accent" disabled>Accept order</Button></td>
                <td className="p-3"><Button variant="accent" loading>Accept order</Button></td>
              </tr>
              {/* Secondary */}
              <tr>
                <td className="p-3 font-semibold text-[#10202D]">Secondary</td>
                <td className="p-3"><Button variant="secondary">Cancel</Button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#F2F4F6] text-[#10202D] border border-[#D5DAE0]">Cancel</button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#E2E5E9] text-[#10202D] border border-[#D5DAE0]">Cancel</button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-white text-[#10202D] border border-[#D5DAE0] ring-2 ring-[#10202D] ring-offset-2">Cancel</button></td>
                <td className="p-3"><Button variant="secondary" disabled>Cancel</Button></td>
                <td className="p-3"><Button variant="secondary" loading>Cancel</Button></td>
              </tr>
              {/* Ghost */}
              <tr>
                <td className="p-3 font-semibold text-[#10202D]">Ghost</td>
                <td className="p-3"><Button variant="ghost">Filter</Button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#ECEEF1] text-[#10202D]">Filter</button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#E2E5E9] text-[#10202D]">Filter</button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-transparent text-[#10202D] ring-2 ring-[#10202D] ring-offset-2">Filter</button></td>
                <td className="p-3"><Button variant="ghost" disabled>Filter</Button></td>
                <td className="p-3"><Button variant="ghost" loading>Filter</Button></td>
              </tr>
              {/* Destructive */}
              <tr>
                <td className="p-3 font-semibold text-[#8E2A22]">Destructive (#B3392F)</td>
                <td className="p-3"><Button variant="destructive">Reject</Button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#9C2F26] text-white">Reject</button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#852720] text-white">Reject</button></td>
                <td className="p-3"><button className="h-10 px-4 py-2 rounded-[8px] text-sm font-semibold bg-[#B3392F] text-white ring-2 ring-[#B3392F] ring-offset-2">Reject</button></td>
                <td className="p-3"><Button variant="destructive" disabled>Reject</Button></td>
                <td className="p-3"><Button variant="destructive" loading>Reject</Button></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Button Sizes */}
        <div className="space-y-2 pt-2">
          <span className="text-caption block font-semibold text-[#5F6C79]">Button Sizes (Small 32px, Default 40px, Large/Mobile 44px, Icon 40px)</span>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small 32px</Button>
            <Button size="default">Default 40px</Button>
            <Button size="lg">Large 44px (Mobile)</Button>
            <Button size="icon" variant="secondary" aria-label="Settings icon button">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Form Controls: Inputs & Select (DESIGN.md Section 7.8) */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-6">
        <div>
          <h2 className="text-section-title">4. Form Controls: Inputs &amp; Select (DESIGN.md Section 7.8)</h2>
          <p className="text-caption mt-1">40px height, white fill, 1px border, 13px label, required gold text asterisk</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Default */}
          <div className="space-y-1.5">
            <Label htmlFor="input-default">Default Input</Label>
            <Input id="input-default" placeholder="name@hotel.com" />
            <p className="text-caption">1px #D5DAE0 border</p>
          </div>

          {/* Focused (Forced Demo) */}
          <div className="space-y-1.5">
            <Label htmlFor="input-focused">Focus State (Demo)</Label>
            <Input
              id="input-focused"
              defaultValue="admin@restaurant.com"
              className="border-[#10202D] ring-3 ring-[#C7A667]/35 outline-none"
            />
            <p className="text-caption text-[#7D6228]">Border #10202D + 3px soft gold ring</p>
          </div>

          {/* Error State */}
          <div className="space-y-1.5">
            <Label htmlFor="input-error" required>Error State</Label>
            <Input id="input-error" defaultValue="invalid-email" error />
            <p className="text-xs text-[#8E2A22]">Invalid email address format</p>
          </div>

          {/* Disabled State */}
          <div className="space-y-1.5">
            <Label htmlFor="input-disabled">Disabled Field</Label>
            <Input id="input-disabled" defaultValue="locked@hotel.com" disabled />
            <p className="text-caption">Fill #F2F4F6, text #AEB7C0</p>
          </div>
        </div>

        {/* Select & Password Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="role-select">Select Control (Dropdown)</Label>
            <Select defaultValue="manager">
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="manager">Manager (Selected Gold Tint)</SelectItem>
                <SelectItem value="chef">Chef</SelectItem>
                <SelectItem value="rider">Rider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pwd-input">Password Field with Eye Toggle</Label>
            <div className="relative">
              <Input
                id="pwd-input"
                type={passwordShown ? "text" : "password"}
                defaultValue="SecretPass123"
                className="pe-10"
              />
              <button
                type="button"
                onClick={() => setPasswordShown(!passwordShown)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[#5F6C79] hover:text-[#10202D] cursor-pointer"
                aria-label="Toggle password"
              >
                {passwordShown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Checkbox and Switch */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <h2 className="text-section-title">5. Checkbox &amp; Switch (DESIGN.md Section 7.8)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* Checkboxes */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox id="chk-unchecked" />
            <Label htmlFor="chk-unchecked">Unchecked (#AEB7C0)</Label>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox id="chk-checked" defaultChecked />
            <Label htmlFor="chk-checked">Checked (Navy #10202D)</Label>
          </div>

          {/* Switches */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Switch id="sw-off" />
            <Label htmlFor="sw-off">Switch Off (#D5DAE0)</Label>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Switch id="sw-on" defaultChecked />
            <Label htmlFor="sw-on">Switch On (Navy Track)</Label>
          </div>
        </div>
      </section>

      {/* 6. Badges: Every Status Color Pair */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <div>
          <h2 className="text-section-title">6. Badges: All Status Colors (DESIGN.md Section 7.2 &amp; 7.9)</h2>
          <p className="text-caption mt-1">22px height, fully rounded pill, 12px semibold text + solid icon dot</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {STATUS_COLORS.map((st) => (
            <div key={st.key} className="p-3 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] flex items-center justify-between">
              <div>
                <span className="text-caption block font-semibold">{st.name}</span>
                <span className="text-[11px] text-[#5F6C79]">{st.desc}</span>
              </div>
              <Badge variant={st.key} dot>
                {st.name}
              </Badge>
            </div>
          ))}

          {/* Brand Badges */}
          <div className="p-3 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] flex items-center justify-between">
            <div>
              <span className="text-caption block font-semibold">Primary Badge</span>
              <span className="text-[11px] text-[#5F6C79]">Dark Midnight</span>
            </div>
            <Badge variant="primary">Brand</Badge>
          </div>

          <div className="p-3 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] flex items-center justify-between">
            <div>
              <span className="text-caption block font-semibold">Accent Badge</span>
              <span className="text-[11px] text-[#5F6C79]">Gold Fill</span>
            </div>
            <Badge variant="accent">New (3)</Badge>
          </div>
        </div>
      </section>

      {/* 7. Tables, Hover & Selected Row, Pagination */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <div>
          <h2 className="text-section-title">7. Tables &amp; Pagination (DESIGN.md Section 7.9)</h2>
          <p className="text-caption mt-1">
            White rows, 1px divider, soft white header row (#F7F7F7), 52px row height. Selected row has Gold Tint fill + 3px gold inline-start bar.
          </p>
        </div>

        <div className="border border-[#E2E5E9] rounded-[8px] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ORDER</TableHead>
                <TableHead>CUSTOMER</TableHead>
                <TableHead>ITEMS</TableHead>
                <TableHead>TOTAL</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>STATE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Default Row */}
              <TableRow>
                <TableCell className="font-semibold">#1041</TableCell>
                <TableCell>Ali Raza</TableCell>
                <TableCell>2x Zinger Burger, 1x Fries</TableCell>
                <TableCell className="tabular-nums font-semibold">Rs 1,800</TableCell>
                <TableCell><Badge variant="warning" dot>Pending</Badge></TableCell>
                <TableCell className="text-caption text-[#5F6C79]">Default Row</TableCell>
              </TableRow>

              {/* Hover Row Demo */}
              <TableRow className="bg-[#F2F4F6]">
                <TableCell className="font-semibold">#1042</TableCell>
                <TableCell>Fatima Zahra</TableCell>
                <TableCell>1x Chicken Karahi, 4x Naan</TableCell>
                <TableCell className="tabular-nums font-semibold">Rs 2,450</TableCell>
                <TableCell><Badge variant="info" dot>Preparing</Badge></TableCell>
                <TableCell className="text-caption font-semibold text-[#10202D]">Hover State Demo (#F2F4F6)</TableCell>
              </TableRow>

              {/* Selected Row Demo */}
              <TableRow selected>
                <TableCell className="font-semibold text-[#7D6228]">#1043</TableCell>
                <TableCell className="font-semibold text-[#7D6228]">Usman Tariq</TableCell>
                <TableCell>3x Beef Biryani, 3x Raita</TableCell>
                <TableCell className="tabular-nums font-semibold text-[#7D6228]">Rs 3,100</TableCell>
                <TableCell><Badge variant="gold" dot>Accepted</Badge></TableCell>
                <TableCell className="text-caption font-semibold text-[#7D6228]">Selected (Gold Tint + 3px Bar)</TableCell>
              </TableRow>

              {/* Success Row */}
              <TableRow>
                <TableCell className="font-semibold">#1044</TableCell>
                <TableCell>Khadija Begum</TableCell>
                <TableCell>1x Club Sandwich</TableCell>
                <TableCell className="tabular-nums font-semibold">Rs 850</TableCell>
                <TableCell><Badge variant="success" dot>Ready</Badge></TableCell>
                <TableCell className="text-caption text-[#5F6C79]">Default Row</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="pt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#prev" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#1" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#2">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#3">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#next" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>

      {/* 8. Cards: Standard & Clickable */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <div>
          <h2 className="text-section-title">8. Cards (DESIGN.md Section 7.9)</h2>
          <p className="text-caption mt-1">12px radius, 20px padding, 1px border. Clickable cards get a 1px gold border and shadow on hover.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Standard Card</CardTitle>
                <Badge variant="neutral">Static</Badge>
              </div>
              <CardDescription>White background with 1px #E2E5E9 border and soft card shadow.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body-primary">
                Used for statistics, dashboards, settings, and forms that do not trigger row selection.
              </p>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-caption">Footer info</span>
              <Button variant="ghost" size="sm">Details</Button>
            </CardFooter>
          </Card>

          <Card clickable>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#10202D]">Clickable Order Card (Hover Me)</CardTitle>
                <Badge variant="gold" dot>New Order</Badge>
              </div>
              <CardDescription>Hover over this card to see the 1px gold border (#C7A667) and elevation.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body-primary">
                Matches Figure 1 in the plan (Section 8.1): order cards in kitchen and delivery columns.
              </p>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-sm font-semibold text-[#10202D] tabular-nums">Total: Rs 1,800</span>
              <Button variant="accent" size="sm">Accept</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 9. Tabs */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <h2 className="text-section-title">9. Tabs (DESIGN.md Section 7.9)</h2>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Orders (18)</TabsTrigger>
            <TabsTrigger value="new">New (3)</TabsTrigger>
            <TabsTrigger value="preparing">In Kitchen (5)</TabsTrigger>
            <TabsTrigger value="delivery">Out for Delivery (2)</TabsTrigger>
            <TabsTrigger value="completed">Delivered (8)</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="p-4 bg-[#F7F7F7] rounded-[8px] border border-[#E2E5E9]">
            <p className="text-body-primary">Active tab has #10202D text with a 2px gold underline (#C7A667).</p>
          </TabsContent>
          <TabsContent value="new" className="p-4 bg-[#F7F7F7] rounded-[8px] border border-[#E2E5E9]">
            <p className="text-body-primary">Showing 3 new orders requiring kitchen acceptance.</p>
          </TabsContent>
        </Tabs>
      </section>

      {/* 10. Overlays: Sheet, Dialog, Alert Dialog, Dropdown Menu */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <div>
          <h2 className="text-section-title">10. Overlays &amp; Interactive Popups</h2>
          <p className="text-caption mt-1">Sheet (480px width), Dialogs (12px radius, light shadow), Dropdown menu</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="primary">Open 480px Side Sheet</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Order Details #1042</SheetTitle>
                <SheetDescription>Side sheet width is exactly 480px on desktop with smooth slide.</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-4 text-sm">
                <div className="p-4 bg-[#F7F7F7] rounded-[8px] border border-[#E2E5E9] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#5F6C79]">Customer:</span>
                    <span className="font-semibold text-[#10202D]">Ali Raza (+92 300 1234567)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5F6C79]">Delivery:</span>
                    <span className="font-semibold text-[#10202D]">House 12, Street 4, Clifton</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5F6C79]">Status:</span>
                    <Badge variant="info" dot>Preparing</Badge>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[#E2E5E9] flex justify-end gap-2">
                <Button variant="accent">Mark Ready</Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open Standard Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Menu Item</DialogTitle>
                <DialogDescription>Dialog window with 12px radius and soft overlay shadow.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="m-item-name">Item Name</Label>
                  <Input id="m-item-name" defaultValue="Chicken Biryani Special" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="m-item-price">Price (PKR)</Label>
                  <Input id="m-item-price" defaultValue="650" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="primary">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Alert Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Open Alert Dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Order #1042?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will notify the customer via WhatsApp that their order cannot be fulfilled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                <AlertDialogAction destructive>Reject Order</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="border border-[#D5DAE0]">
                Dropdown Menu <ChevronDown className="ms-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Print Kitchen KOT</DropdownMenuItem>
              <DropdownMenuItem selected>Assign Rider (Selected)</DropdownMenuItem>
              <DropdownMenuItem>Send Payment Reminder</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[#8E2A22]">Cancel Order</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* 11. Skeletons & Spinners */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <div>
          <h2 className="text-section-title">11. Loading States: Skeletons &amp; Spinners (DESIGN.md Section 7.10)</h2>
          <p className="text-caption mt-1">Skeleton base #ECEEF1 with soft shimmer. Respects prefers-reduced-motion.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Skeleton sample */}
          <div className="p-4 bg-[#F7F7F7] rounded-[8px] border border-[#E2E5E9] space-y-3">
            <span className="text-caption block font-semibold text-[#5F6C79]">Skeleton Layout Previews</span>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
          </div>

          {/* Spinners */}
          <div className="p-4 bg-[#F7F7F7] rounded-[8px] border border-[#E2E5E9] space-y-3">
            <span className="text-caption block font-semibold text-[#5F6C79]">16px Inline Spinners (Button &amp; Standalone)</span>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-[#10202D]">
                <Spinner size="default" />
                <span>Default 16px</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#7D6228]">
                <Spinner size="sm" />
                <span>Small 14px</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#10202D]">
                <Spinner size="lg" />
                <span>Large 24px</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 max-w-md">
          <div className="flex justify-between text-xs text-[#5F6C79]">
            <span className="font-medium">Order Preparation Progress</span>
            <span className="font-mono tabular-nums">65%</span>
          </div>
          <Progress value={65} />
        </div>
      </section>

      {/* 12. Alerts & Toast Notifications */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-6">
        <div>
          <h2 className="text-section-title">12. Alerts &amp; Sonner Toasts (DESIGN.md Section 7.10)</h2>
          <p className="text-caption mt-1">Alert tints with icons; Sonner toasts positioned at bottom-end (bottom-left in RTL)</p>
        </div>

        {/* Toast Trigger Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              toast.success("Order #1042 accepted successfully!", {
                description: "Kitchen has been notified via dashboard notification.",
              })
            }
          >
            Trigger Success Toast
          </Button>

          <Button
            variant="destructive"
            onClick={() =>
              toast.error("Failed to connect to WhatsApp API", {
                description: "Meta token expired. Please reconnect in settings.",
              })
            }
          >
            Trigger Error Toast
          </Button>

          <Button
            variant="ghost"
            className="border border-[#D5DAE0]"
            onClick={() => setPersistentAlert(!persistentAlert)}
          >
            {persistentAlert ? "Hide Persistent Alert" : "Show Persistent Alert"}
          </Button>
        </div>

        {/* Persistent Alert */}
        {persistentAlert && (
          <Alert variant="warning" className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <TriangleAlert className="h-4 w-4" />
              <div>
                <AlertTitle>Persistent Warning: WhatsApp Webhook Delayed</AlertTitle>
                <AlertDescription>
                  Inbound message queue latency is currently 12 seconds.
                </AlertDescription>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="border border-[#B7791F]/30 text-[#7A4E0B]">
              <RotateCcw className="me-1 h-3.5 w-3.5" /> Retry
            </Button>
          </Alert>
        )}

        {/* All Alert Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert variant="success">
            <CircleCheck className="h-4 w-4" />
            <div>
              <AlertTitle>Success Alert</AlertTitle>
              <AlertDescription>Payment verified via Easypaisa screenshot.</AlertDescription>
            </div>
          </Alert>

          <Alert variant="destructive">
            <CircleAlert className="h-4 w-4" />
            <div>
              <AlertTitle>Destructive Alert</AlertTitle>
              <AlertDescription>Invalid credentials entered. Please try again.</AlertDescription>
            </div>
          </Alert>

          <Alert variant="info">
            <Info className="h-4 w-4" />
            <div>
              <AlertTitle>Info Alert</AlertTitle>
              <AlertDescription>Daily automated backup completed at 03:00 AM.</AlertDescription>
            </div>
          </Alert>

          <Alert variant="default">
            <Info className="h-4 w-4" />
            <div>
              <AlertTitle>Default Neutral Alert</AlertTitle>
              <AlertDescription>Standard system informational note.</AlertDescription>
            </div>
          </Alert>
        </div>
      </section>

      {/* 13. Avatars: Light Surface & Dark Midnight Surface */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-6">
        <div>
          <h2 className="text-section-title">13. Avatars at 24, 32, 40 &amp; 64px (DESIGN.md Section 7.12)</h2>
          <p className="text-caption mt-1">Light surface fallback (#F4ECDC text #7D6228) and dark sidebar fallback (#22394B text #E8D9B5)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Light surface */}
          <div className="p-6 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] space-y-4">
            <span className="text-caption font-semibold text-[#5F6C79] block">Light Surface Avatars</span>
            <div className="flex items-center gap-6">
              <div className="text-center space-y-1">
                <Avatar size="xs">
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#5F6C79] block">24px</span>
              </div>

              <div className="text-center space-y-1">
                <Avatar size="sm">
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#5F6C79] block">32px</span>
              </div>

              <div className="text-center space-y-1">
                <Avatar size="default">
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#5F6C79] block">40px</span>
              </div>

              <div className="text-center space-y-1">
                <Avatar size="lg">
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#5F6C79] block">64px</span>
              </div>

              <div className="text-center space-y-1">
                <Avatar size="default" shape="square">
                  <AvatarFallback>YB</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#5F6C79] block">Logo (Square)</span>
              </div>
            </div>
          </div>

          {/* Dark Midnight surface */}
          <div className="p-6 bg-[#10202D] rounded-[8px] space-y-4">
            <span className="text-caption font-semibold text-[#A9B4BE] block">Dark Sidebar Surface Avatars (#10202D)</span>
            <div className="flex items-center gap-6">
              <div className="text-center space-y-1">
                <Avatar size="xs">
                  <AvatarFallback dark>AR</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#A9B4BE] block">24px</span>
              </div>

              <div className="text-center space-y-1">
                <Avatar size="sm">
                  <AvatarFallback dark>AR</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#A9B4BE] block">32px</span>
              </div>

              <div className="text-center space-y-1">
                <Avatar size="default">
                  <AvatarFallback dark>AR</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#A9B4BE] block">40px</span>
              </div>

              <div className="text-center space-y-1">
                <Avatar size="lg">
                  <AvatarFallback dark>AR</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#A9B4BE] block">64px</span>
              </div>

              <div className="text-center space-y-1">
                <Avatar size="default" shape="square">
                  <AvatarFallback dark>YB</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-[#A9B4BE] block">Logo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 14. Icon Set from DESIGN.md Section 7.11 */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-4">
        <div>
          <h2 className="text-section-title">14. Icon Set (DESIGN.md Section 7.11)</h2>
          <p className="text-caption mt-1">lucide-react outline icons with stroke 1.75; 20px in nav, 16px inline, directional icons flip in RTL</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {iconSet.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.name}
                className="p-3 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] flex items-center gap-3"
              >
                <IconComp className="h-5 w-5 text-[#10202D] stroke-[1.75] shrink-0 rtl:rotate-180" />
                <div className="overflow-hidden">
                  <span className="text-xs font-semibold text-[#10202D] block truncate">{item.name}</span>
                  <span className="text-[11px] text-[#5F6C79] block truncate">{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 15. Charts: Bar, Line & Donut (DESIGN.md Section 7.14) */}
      <section className="bg-white p-6 rounded-[12px] border border-[#E2E5E9] shadow-card space-y-6">
        <div>
          <h2 className="text-section-title">15. Charts: Bar, Line &amp; Donut (DESIGN.md Section 7.14)</h2>
          <p className="text-caption mt-1">Midnight #10202D, peak gold #C7A667, area fill gold-tint #F4ECDC, gridlines #E2E5E9</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="p-4 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] space-y-2">
            <span className="text-caption font-semibold text-[#5F6C79] block">Bar: Orders per Hour (Peak Bar Gold)</span>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HOURLY_ORDERS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E5E9" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#5F6C79" }} axisLine={{ stroke: "#E2E5E9" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#5F6C79" }} axisLine={{ stroke: "#E2E5E9" }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E5E9", borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                    {HOURLY_ORDERS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isPeak ? "#C7A667" : "#10202D"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area / Line Chart */}
          <div className="p-4 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] space-y-2">
            <span className="text-caption font-semibold text-[#5F6C79] block">Line/Area: Sales Over Time (Gold Tint Fill)</span>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SALES_TIMELINE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E5E9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#5F6C79" }} axisLine={{ stroke: "#E2E5E9" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#5F6C79" }} axisLine={{ stroke: "#E2E5E9" }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E5E9", borderRadius: 8, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#10202D" strokeWidth={2} fill="#F4ECDC" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="p-4 bg-[#F7F7F7] border border-[#E2E5E9] rounded-[8px] space-y-2">
            <span className="text-caption font-semibold text-[#5F6C79] block">Donut: COD vs Online Payment</span>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PAYMENT_BREAKDOWN}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {PAYMENT_BREAKDOWN.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E5E9", borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10202D]" />
                <span className="text-[#5F6C79]">COD (65%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C7A667]" />
                <span className="text-[#5F6C79]">Online (35%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
