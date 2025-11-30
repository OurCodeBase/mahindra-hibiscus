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
  const [service, setService] = useState<"service" | "service-cv">("service")
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
  const actionBtns: Array<{ title: string, color: string, callback: () => void }> = [
    { title: "LOGOUT", color: "bg-rose-500", callback: () => {callbacks('logout')} },
    { title: "CLEAR", color: "bg-slate-500", callback: () => {callbacks('clear')} }
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
      const database = await searchConsole.getAllKyc(service);
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
    <div className="shadow-xl p-4 max-w-md">
      {sheet.length == 0 && <Logo/>}
      <form onSubmit={handleSearch} className={"flex flex-row w-full justify-center"}>
        <input
          type="text"
          name="vinnos"
          placeholder="Feed me vin no. column"
          className="px-4 bg-green-50 text-green-600 placeholder-stone-400 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all cursor-pointer"
        />
        <button
          type="submit"
          className="bg-lime-600 ml-2 p-3 hover:bg-lime-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader className="animate-spin"/> : <Search/>}
        </button>
      </form>
      <div className="mt-4 w-full flex flex-row justify-center">
        {["personal", "commercial"].map((value, index) => (
          <span key={value + index} className="mr-3">
            <input name="hibiscus-cartype"
              id={"hibiscus-" + value}
              type="radio"
              onChange={(e) => {
                if (e.currentTarget.id == "hibiscus-commercial") setService("service-cv")
                else setService("service")
              }}
              disabled={loading}
              defaultChecked={index == 0 ? true : false}
              className="size-4 radio radio-success"
            />
            <label className="ml-2 text-lime-400 font-mono uppercase">{value}</label>
          </span>
        ))}
      </div>
      <div className="w-full flex justify-center mt-2">
        {actionBtns.map(option => <button onClick={option.callback} key={option.title}
          className={`py-2 shadow-lg ${option.color} cursor-pointer text-green-100 font-mono mr-2 px-2 h-min text-nowrap`}>
          {option.title}
        </button>)}
      </div>
      {sheet.length > 0 && <div className="mt-2">
        <div className="backdrop-brightness-60 max-h-[300px] overflow-auto backdrop-contrast-125 font-mono border-1 border-stone-400 rounded-md p-2">
          <Spreadsheet data={sheet} columnLabels={["VIN Number", "KYC", "SignUp", "Customer"]}/>
        </div>
      </div>}
    </div>
    {notification ? <div className="w-full fixed top-0 flex justify-center">
      <p className="bg-orange-300 text-orange-800 border-3 border-orange-400 px-2 py-0 text-sm font-bold font-mono">
        {notification}
      </p>
    </div> : ''}
  </>
}
