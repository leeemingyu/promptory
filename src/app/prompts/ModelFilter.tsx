"use client";

import { useRouter } from "next/navigation";

type ModelFilterProps = {
  options: string[];
  value: string;
  query: string;
  sort: string;
};

export default function ModelFilter({
  options,
  value,
  query,
  sort,
}: ModelFilterProps) {
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextModel = event.target.value;
    const params = new URLSearchParams();
    if (sort && sort !== "latest") params.set("sort", sort);
    if (query) params.set("q", query);
    if (nextModel) params.set("model", nextModel);
    const qs = params.toString();
    router.push(qs ? `/prompts?${qs}` : "/prompts");
  };

  return (
    <select
      name="model"
      value={value}
      onChange={handleChange}
      className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
    >
      <option value="">전체</option>
      {options.map((model) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>
  );
}
