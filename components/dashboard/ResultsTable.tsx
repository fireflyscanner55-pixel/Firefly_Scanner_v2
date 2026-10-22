import type {
  TestResult,
} from "@/types/dashboard";

type ResultsTableProps = {
  results: TestResult[];
};

export default function ResultsTable({
  results,
}: ResultsTableProps) {
  return (
    <section className="w-full">
      <div
        className="
          overflow-x-auto
          border border-slate-300/80
          bg-white
          shadow-[0_8px_24px_rgba(15,23,42,0.04)]
        "
      >
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="border-b border-slate-300/80">
              <th
                scope="col"
                className="
                  px-4 py-2
                  text-center text-[10px]
                  font-semibold text-slate-600
                "
              >
                Physical
              </th>

              <th
                scope="col"
                className="
                  px-4 py-2
                  text-center text-[10px]
                  font-semibold text-slate-600
                "
              >
                Data
              </th>
            </tr>
          </thead>

          <tbody>
            {results.map((result, index) => (
              <tr
                key={`${result.physical}-${index}`}
                className="
                  border-b border-slate-200/80
                  last:border-b-0
                "
              >
                <td
                  className="
                    px-4 py-1.5
                    text-center text-[10px]
                    font-medium text-slate-700
                    sm:text-xs
                  "
                >
                  {result.physical}
                </td>

                <td
                  className="
                    px-4 py-1.5
                    text-center text-[10px]
                    font-medium text-slate-700
                    sm:text-xs
                  "
                >
                  {result.data}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}