import { TEST_ACCOUNTS } from "../constants";

type TestAccountsProps = {
  fillAccount: (acc: (typeof TEST_ACCOUNTS)[number]) => void;
  loading: boolean;
};

export default function TestAccounts({
  fillAccount,
  loading,
}: TestAccountsProps) {
  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <p className="mb-3 text-sm font-medium text-gray-700">บัญชีทดสอบ</p>
      <div className="space-y-2">
        {TEST_ACCOUNTS.map((acc) => (
          <button
            key={acc.role}
            type="button"
            onClick={() => fillAccount(acc)}
            disabled={loading}
            className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60 ${acc.color}`}
          >
            <span
              className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${acc.dot}`}
              aria-hidden="true"
            />
            <span className="min-w-20 font-semibold">{acc.role}</span>
            <span className="truncate text-xs opacity-90">{acc.email}</span>
            <span className="ml-auto flex-shrink-0 text-xs opacity-80">
              รหัส: {acc.password}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
