import React from "react";
import { Search, Sliders } from "lucide-react";
import { Input } from "@/components/ui/input";

function SearchBar({ placeholder, className, searchQuery, setSearchQuery }) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

export default SearchBar;
