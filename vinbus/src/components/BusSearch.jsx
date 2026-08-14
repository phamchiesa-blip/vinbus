import { Search, X } from "lucide-react";

const BusSearch = ({ value, onChange }) => {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="group flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all duration-300 focus-within:border-emerald-400 focus-within:shadow-lg focus-within:shadow-emerald-500/10">
        <Search className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-focus-within:text-emerald-500" />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tìm theo mã tuyến, điểm đi hoặc điểm đến..."
          className="ml-3 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 md:text-base"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-3 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BusSearch;