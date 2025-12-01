import { useToken } from "@/hooks";
import { Logo } from "@/components";
import { useEffect, useState } from "react";
import Spreadsheet from "react-spreadsheet";
import { Loader, Search } from "lucide-react";
import { SearchConsole } from "@/utils/search";

function Checkbox({ onChange, checked }: { onChange: (checked: boolean) => void, checked: boolean }) {
  return (
    <div className="relative flex justify-center items-center">
      <label htmlFor="checkbox" className="relative flex size-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-tr from-[#4158D0] via-[#C850C0] to-[#FFCC70] p-2 duration-100 hover:p-2.5">
        <input checked={checked} type="checkbox" className="group peer hidden" id="checkbox" onChange={(e) => {onChange(e.currentTarget.checked)}}/>
        <label htmlFor="checkbox" className="size-full rounded-md bg-background peer-checked:size-0"/>
        <div className="absolute left-[0.8rem] h-[4px] w-[14px] -translate-y-10 translate-x-10 rotate-[-41deg] rounded-sm bg-white duration-300 peer-checked:translate-x-0 peer-checked:translate-y-0"/>
        <div className="absolute left-[0.4rem] top-4 h-[4px] w-[10px] -translate-x-10 -translate-y-10 rotate-[45deg] rounded-sm bg-white duration-300 peer-checked:translate-x-0 peer-checked:translate-y-0"/>
      </label>
      <span className="ml-2 flex flex-row w-[70px] font-bold">Check Commercials</span>
    </div>
  )
}

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
  const clickables: Array<{ title: string, color: string, callback: () => void }> = [
    { title: "LOGOUT", color: "bg-[#D94E67]", callback: () => {callbacks('logout')} },
    { title: "CLEAR", color: "bg-[#04668C]", callback: () => {callbacks('clear')} }
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
    <div className="max-w-md bg-gradient-to-tr from-background to-transparent">
      <Logo/>
      <form onSubmit={handleSearch} className="flex justify-center py-10 w-full">
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
        <div className="mx-2 border-l-1"></div>
        <Checkbox checked={service == "service-cv"} onChange={(checked) => {setService(checked ? "service-cv" : "service")}}/>
      </form>
      {sheet.length > 0 && <div className="mt-2">
        <div className="max-h-[300px] overflow-auto">
          <Spreadsheet data={sheet} columnLabels={["VIN", "KYC", "SignUp", "Car Owner"]}/>
        </div>
      </div>}
      <div className="w-full flex justify-center py-4 tracking-widest font-mono font-bold">
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
