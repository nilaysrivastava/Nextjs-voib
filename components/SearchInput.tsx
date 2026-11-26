"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";
import useDebounce from "@/hooks/useDebounce";
export default function SearchInput({
  initialValue = "",
}: {
  initialValue?: string;
}) {
  const router = useRouter(),
    [value, setValue] = useState(initialValue),
    edited = useRef(false),
    debounced = useDebounce(value, 350);
  function change(next: string) {
    edited.current = true;
    setValue(next);
  }
  useEffect(() => {
    if (!edited.current) setValue(initialValue);
  }, [initialValue]);
  useEffect(() => {
    if (!edited.current || value !== debounced) return;
    edited.current = false;
    if (debounced !== initialValue)
      router.replace(
        "/search" +
          (debounced ? "?title=" + encodeURIComponent(debounced) : ""),
        { scroll: false },
      );
  }, [debounced, value, initialValue, router]);
  useEffect(() => {
    const sync = () => {
      edited.current = false;
      setValue(new URL(window.location.href).searchParams.get("title") || "");
    };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  return (
    <div className="search-field">
      <FiSearch size={24} />
      <input
        aria-label="Search records by title"
        type="search"
        placeholder="What would you like to hear?"
        value={value}
        onChange={(e) => change(e.target.value)}
      />
      {value && (
        <button
          aria-label="Clear search"
          className="icon-button"
          onClick={() => change("")}
        >
          <FiX size={19} />
        </button>
      )}
      <span className="search-hint eyebrow">SEARCH BY TITLE</span>
    </div>
  );
}
