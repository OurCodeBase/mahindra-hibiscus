import { useToken } from "@/hooks";
import { Logo } from "@/components";
import { useEffect, useState } from "react";
import Spreadsheet from "react-spreadsheet";
import { Loader, Search } from "lucide-react";
import { SearchConsole } from "@/utils/search";

export default function App() {
  const { token, removeToken } = useToken();
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<Array<any>>([]);
  const [notification, setNotification] = useState<string | undefined>()
  const callbacks = (action: 'logout' | 'clear') => {
    switch (action) {
      case 'logout':
        setNotification("Reopen this extension window.");
        removeToken();
        break;
      case 'clear':
        chrome.storage.session.remove("hibiscus-database");
        setSheet([]);
        break;
    }
  }
  const clickables: Array<{ title: string, color: string, callback: () => void }> = [
    { title: "Leave", color: "bg-[#D94E67]", callback: () => {callbacks('logout')} },
    { title: "Clear", color: "bg-[#04668C]", callback: () => {callbacks('clear')} }
  ]
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('vinnos')?.toString().toUpperCase() || "";
    if (!search.trim()) return;
    setLoading(true);
    setNotification(undefined);
    try {
      if (!token) throw new Error("You need a session id first.");
      const searchConsole = new SearchConsole(token, search);
      const database = await searchConsole.getAllKyc();
      chrome.storage.session.set({ "hibiscus-database": JSON.stringify(database) });
      setSheet(database);
    } catch (e) {
      if (!(e instanceof Error)) return console.error(e);
      setNotification(e.message);
      if (e.name == "AUTHORIZATION-REVOKED") removeToken();
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    chrome.storage.session.get("hibiscus-database").then((response) => {
      if (response && response["hibiscus-database"])
        setSheet(JSON.parse(response["hibiscus-database"]))
    })
  }, [])
  return <>
    <div className="max-w-md bg-gradient-to-tr from-background to-transparent">
      <Logo/>
      <div className="w-full flex justify-center pt-8">
        <p className="bg-orange-300 text-orange-800 border-3 border-orange-400 p-1 px-3 text-xs font-black tracking-widest">
          {token ? (`SEGMENT: ${token.subdomain == "service" ? "PERSONAL": "COMMERCIAL"}`) : "NO SOURCE"}
        </p>
      </div>
      <form onSubmit={handleSearch} className="flex justify-center pt-2 pb-10 w-full">
        <input
          type="text"
          name="vinnos"
          placeholder="Feed me vin no. column"
          className="px-4 bg-rose-50 text-[#F25764] placeholder-stone-400 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f25c78] focus:ring-2 focus:ring-[#f79dae] transition-all cursor-pointer"
        />
        <button
          type="submit"
          className="bg-contessa ml-2 p-3 hover:bg-contessa-dim text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? <Loader className="animate-spin"/> : <Search/>}
        </button>
      </form>
      {sheet.length > 0 ? <div className="mt-2">
        <div className="max-h-[300px] overflow-auto">
          <Spreadsheet data={sheet} columnLabels={["VIN", "KYC", "SignUp", "Car Owner"]}/>
        </div>
      </div> : ''}
      <div className="w-full flex justify-center py-4 tracking-widest">
        {clickables.map(option => <button onClick={option.callback} key={option.title}
          className={`py-2 shadow-lg ${option.color} cursor-pointer mr-2 px-2 h-min text-nowrap rounded-md text-xs`}>
          {option.title}
        </button>)}
      </div>
    </div>
    {notification ? <div className="w-full fixed top-0 flex justify-center">
      <p className="bg-orange-300 text-orange-800 border-3 border-orange-400 px-2 py-0 text-sm font-bold font-mono">
        {notification}
      </p>
    </div> : ''}
  </>
}
