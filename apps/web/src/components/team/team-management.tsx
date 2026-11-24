"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Plus,
  Edit2,
  UserX,
  AlertCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import type { User, Role } from "@app/shared";
import { useTeam, useToggleUserActive } from "@/hooks/use-team";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { TeamMemberSheet } from "./team-member-sheet";
import { toast } from "sonner";

const ROLE_BADGE_VARIANTS: Record<
  Role,
  "primary" | "midnight" | "info" | "warning" | "accent" | "neutral"
> = {
  owner: "primary",
  manager: "midnight",
  chef: "info",
  rider: "warning",
  super_admin: "accent",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const ITEMS_PER_PAGE = 20;

export function TeamManagement() {
  const t = useTranslations("team");
  const { data: team = [], isLoading, isError, refetch } = useTeam();
  const toggleActive = useToggleUserActive();

  const [search, setSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<User | null>(null);

  // Deactivate confirmation state
  const [deactivatingMember, setDeactivatingMember] = React.useState<User | null>(null);

  // Filtered members
  const filteredTeam = React.useMemo(() => {
    if (!search.trim()) return team;
    const query = search.toLowerCase();
    return team.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query)
    );
  }, [team, search]);

  // Pagination calculation
  const totalItems = filteredTeam.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = React.useMemo(() => {
    return filteredTeam.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTeam, startIndex]);

  // Reset to page 1 on search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setSelectedMember(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (member: User) => {
    setSelectedMember(member);
    setSheetOpen(true);
  };

  const handleToggleStatus = (member: User) => {
    if (member.is_active) {
      // Prompt confirm dialog when deactivating
      setDeactivatingMember(member);
    } else {
      // Activate immediately
      toggleActive.mutate(
        { id: member.id, is_active: true },
        {
          onSuccess: () => toast.success(t("toast.activated")),
          onError: () => toast.error(t("toast.error")),
        }
      );
    }
  };

  const handleConfirmDeactivate = () => {
    if (!deactivatingMember) return;
    toggleActive.mutate(
      { id: deactivatingMember.id, is_active: false },
      {
        onSuccess: () => {
          toast.success(t("toast.deactivated"));
          setDeactivatingMember(null);
        },
        onError: () => toast.error(t("toast.error")),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#10202D]">
            {t("title")}
          </h1>
          <p className="text-xs text-[#5F6C79] mt-1">{t("subtitle")}</p>
        </div>

        {/* Add Member Gold Button */}
        <Button
          onClick={handleOpenAdd}
          className="h-10 bg-[#C7A667] text-[#10202D] hover:bg-[#B5964F] active:bg-[#A3853F] font-semibold transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t("addMember")}</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6C79]" />
        <Input
          value={search}
          onChange={handleSearchChange}
          placeholder={t("searchPlaceholder")}
          className="ps-9 h-10 border-[#E2E5E9] bg-white text-sm focus-visible:ring-[#10202D]"
        />
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="rounded-[12px] border border-[#E2E5E9] bg-white p-6 shadow-xs space-y-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#E2E5E9]/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-[12px] border border-[#F8E4E1] bg-white p-8 text-center space-y-3 shadow-xs">
          <AlertCircle className="mx-auto h-8 w-8 text-[#8E2A22]" />
          <h3 className="text-base font-semibold text-[#10202D]">
            {t("toast.error")}
          </h3>
          <Button
            onClick={() => refetch()}
            variant="secondary"
            className="mt-2 h-9 border-[#E2E5E9]"
          >
            <RefreshCw className="me-2 h-4 w-4" />
            {t("pagination.prev")}
          </Button>
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="rounded-[12px] border border-[#E2E5E9] bg-white p-12 text-center shadow-xs">
          <Users className="mx-auto h-10 w-10 text-[#5F6C79] mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-[#10202D]">
            {t("empty.title")}
          </h3>
          <p className="text-xs text-[#5F6C79] mt-1 max-w-sm mx-auto">
            {t("empty.subtitle")}
          </p>
        </div>
      ) : (
        <div className="rounded-[12px] border border-[#E2E5E9] bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E2E5E9] bg-[#F7F7F7] hover:bg-[#F7F7F7]">
                <TableHead className="py-3 ps-6 text-start text-[12px] font-semibold uppercase tracking-wider text-[#5F6C79]">
                  {t("columns.member")}
                </TableHead>
                <TableHead className="py-3 text-start text-[12px] font-semibold uppercase tracking-wider text-[#5F6C79]">
                  {t("columns.email")}
                </TableHead>
                <TableHead className="py-3 text-start text-[12px] font-semibold uppercase tracking-wider text-[#5F6C79]">
                  {t("columns.role")}
                </TableHead>
                <TableHead className="py-3 text-start text-[12px] font-semibold uppercase tracking-wider text-[#5F6C79]">
                  {t("columns.language")}
                </TableHead>
                <TableHead className="py-3 text-start text-[12px] font-semibold uppercase tracking-wider text-[#5F6C79]">
                  {t("columns.status")}
                </TableHead>
                <TableHead className="py-3 pe-6 text-end text-[12px] font-semibold uppercase tracking-wider text-[#5F6C79]">
                  {t("columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-b border-[#E2E5E9] transition-colors hover:bg-[#F2F4F6]"
                >
                  {/* Member Name and Avatar */}
                  <TableCell className="py-3.5 ps-6 text-start">
                    <div className="flex items-center gap-3">
                      <Avatar size="default" className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm text-[#10202D]">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-[#5F6C79]">
                          ID: {member.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="py-3.5 text-start text-sm text-[#4A5865]">
                    {member.email}
                  </TableCell>

                  {/* Role Badge */}
                  <TableCell className="py-3.5 text-start">
                    <Badge
                      variant={ROLE_BADGE_VARIANTS[member.role] || "neutral"}
                      className="capitalize"
                    >
                      {member.role === "owner"
                        ? t("roles.owner")
                        : member.role === "manager"
                        ? t("roles.manager")
                        : member.role === "chef"
                        ? t("roles.chef")
                        : member.role === "rider"
                        ? t("roles.rider")
                        : t("roles.super_admin")}
                    </Badge>
                  </TableCell>

                  {/* Preferred Language */}
                  <TableCell className="py-3.5 text-start text-xs text-[#5F6C79]">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#F7F7F7] border border-[#E2E5E9] font-medium text-[#10202D]">
                      {member.language === "ar"
                        ? t("languages.ar")
                        : member.language === "ur-Latn"
                        ? t("languages.ur")
                        : t("languages.en")}
                    </span>
                  </TableCell>

                  {/* Active Switch */}
                  <TableCell className="py-3.5 text-start">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={member.is_active}
                        onCheckedChange={() => handleToggleStatus(member)}
                        aria-label={`Toggle status for ${member.name}`}
                      />
                      <span className="text-xs text-[#5F6C79]">
                        {member.is_active
                          ? t("status.active")
                          : t("status.inactive")}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3.5 pe-6 text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(member)}
                        className="h-8 w-8 p-0 text-[#10202D] hover:bg-[#F2F4F6]"
                        title={t("actions.edit")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {member.is_active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeactivatingMember(member)}
                          className="h-8 w-8 p-0 text-[#8E2A22] hover:bg-[#F8E4E1]"
                          title={t("actions.deactivate")}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#E2E5E9] bg-[#F7F7F7]">
              <span className="text-xs text-[#5F6C79]">
                {t("pagination.showing", {
                  start: startIndex + 1,
                  end: Math.min(startIndex + ITEMS_PER_PAGE, totalItems),
                  total: totalItems,
                })}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 border-[#D5DAE0] text-xs font-medium text-[#10202D] hover:bg-[#F2F4F6] disabled:opacity-50"
                >
                  {t("pagination.prev")}
                </Button>
                <span className="text-xs font-semibold px-2 text-[#10202D]">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 border-[#D5DAE0] text-xs font-medium text-[#10202D] hover:bg-[#F2F4F6] disabled:opacity-50"
                >
                  {t("pagination.next")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Member Sheet */}
      <TeamMemberSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        member={selectedMember}
      />

      {/* Deactivate Confirm AlertDialog */}
      <AlertDialog
        open={Boolean(deactivatingMember)}
        onOpenChange={(open) => {
          if (!open) setDeactivatingMember(null);
        }}
      >
        <AlertDialogContent className="rounded-[12px] border border-[#E2E5E9] bg-white p-6 shadow-[0_8px_24px_rgba(16,32,45,0.12)]">
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle className="text-lg font-semibold text-[#10202D]">
              {t("deactivateDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#5F6C79] mt-2 leading-relaxed">
              {t("deactivateDialog.description", {
                name: deactivatingMember?.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex flex-row justify-end gap-2">
            <AlertDialogCancel className="h-9 border-[#D5DAE0] text-sm">
              {t("deactivateDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeactivate}
              className="h-9 bg-[#B3392F] hover:bg-[#9C2F26] text-white text-sm font-semibold transition-colors"
            >
              {t("deactivateDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
