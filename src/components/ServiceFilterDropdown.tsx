"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Filter } from "lucide-react";
import { Dropdown } from "@/components/Dropdown";

interface ServiceFilterDropdownProps {
  currentValue?: "all-services" | "seo-tracked" | "geo-tracked" | "all" | "seo" | "geo";
  onSelect?: (value: "all-services" | "seo-tracked" | "geo-tracked") => void;
}

export default function ServiceFilterDropdown({ currentValue, onSelect }: ServiceFilterDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active filter from pathname or prop
  let activeValue: "all-services" | "seo-tracked" | "geo-tracked" = "all-services";
  if (currentValue === "seo" || currentValue === "seo-tracked" || pathname.includes("/seo-tracked") || pathname.includes("/services/seo")) {
    activeValue = "seo-tracked";
  } else if (currentValue === "geo" || currentValue === "geo-tracked" || pathname.includes("/geo-tracked") || pathname.includes("/services/geo")) {
    activeValue = "geo-tracked";
  } else {
    activeValue = "all-services";
  }

  const handleFilterChange = (val: string) => {
    let targetRoute = "/dashboard/services/all-services";
    let filterVal: "all-services" | "seo-tracked" | "geo-tracked" = "all-services";

    if (val === "seo-tracked" || val === "seo") {
      targetRoute = "/dashboard/services/seo-tracked";
      filterVal = "seo-tracked";
    } else if (val === "geo-tracked" || val === "geo") {
      targetRoute = "/dashboard/services/geo-tracked";
      filterVal = "geo-tracked";
    } else {
      targetRoute = "/dashboard/services/all-services";
      filterVal = "all-services";
    }

    if (onSelect) {
      onSelect(filterVal);
    }
    
    if (pathname !== targetRoute) {
      router.push(targetRoute);
    }
  };

  const getLabelText = () => {
    switch (activeValue) {
      case "seo-tracked":
        return "SEO Tracked";
      case "geo-tracked":
        return "GEO Tracked";
      case "all-services":
      default:
        return "All Services";
    }
  };

  return (
    <Dropdown
      variant="filter"
      value={activeValue === "seo-tracked" ? "seo" : activeValue === "geo-tracked" ? "geo" : "all"}
      onChange={handleFilterChange}
      options={[
        { value: "all", label: "All Services" },
        { value: "seo", label: "SEO Tracked" },
        { value: "geo", label: "GEO Tracked" }
      ]}
      trigger={
        <div className="flex items-center gap-2 bg-card border border-border/80 rounded-full px-[14px] py-[6px] px-4 py-2 text-xs font-semibold text-foreground shadow-[0_15px_40px_rgba(0,0,0,0.35)] transition-all duration-250 ease-out hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(255,90,31,0.15)] outline-none cursor-pointer">
          <Filter size={14} className="text-muted-foreground" />
          <span>Filter:</span>
          <div className="flex items-center gap-1 font-bold text-foreground">
            <span>{getLabelText()}</span>
          </div>
        </div>
      }
    />
  );
}
