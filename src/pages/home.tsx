import { useToken } from "../hooks";
import { Logo } from "../components";
import { useEffect, useState } from "react";
import Spreadsheet from "react-spreadsheet";
import { Info, Loader, Search } from "lucide-react";

export default function App() {
  const { token, removeToken } = useToken();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<Array<any>>([]);
  const [api, setApi] = useState<"service" | "service-cv">("service")
  const [exception, setException] = useState<string | undefined>()
  const connectToBackend = async (vinnos: Array<string>) => {
    try {
      if (!token) return;
      const database = [];
      for (let index = 0; index < vinnos.length; index++) {
        const request = await fetch(`https://${api}.mahindramobilitysolution.com/iTraMS-webservices/kyc/getAllKyc`, {
          method: "POST",
          headers: {
            "accept": "application/json",
            "authorization": token.authorization,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            direction: "ascending",
            sortingAttribute: "vinNumber",
            pageSize: 10,
            recordsCountToFetch: 100,
            pageNumber: 0,
            textToFilter: vinnos[index]
          }),
          credentials: "include"
        });
        if (request.status == 401) {
          removeToken();
          setException("Your session has been expired!")
          setLoading(false);
          return;
        }
        const response = await request.json();
        if (response.statusCode == 200) {
          const dataModel = response["dataModel"]["data"]
          if (dataModel.length > 0) {
            const row = [
              { value: vinnos[index] },
              { value: "Yes" },
              { value: dataModel[0].signupStatus == false ? "No" : "Yes" },
              { value: dataModel[0].name },
            ]
            database.push(row);
          } else {
            const row = [
              { value: vinnos[index] },
              { value: "No" },
            ]
            database.push(row);
          }
        } else {
          const row = [{ value: vinnos[index] }]
          database.push(row);
        }
      }
      chrome.storage.session.set({ "hibiscus-database": JSON.stringify(database) })
      setSheet(database);
    } catch (e) {
      console.log(e);
      setException("Something went wrong...");
    } finally {
      setLoading(false);
    }
  }
  const actionBtns: Array<{ title: string, color: string, callback: () => void }> = [
    {
      title: "LOGOUT",
      color: "bg-rose-500",
      callback: () => {
        setException("LOGOUT: Close the extension popup.")
        removeToken()
      }
    },
    {
      title: "CLEAR",
      color: "bg-slate-500",
      callback: () => {
        chrome.storage.session.remove("hibiscus-database");
        setSheet([]);
      }
    },
  ]
  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setException(undefined);
    connectToBackend(search.split(' '));
  }
  useEffect(() => {
    chrome.storage.session.get("hibiscus-database").then((response) => {
      if (response && response["hibiscus-database"]) setSheet(JSON.parse(response["hibiscus-database"]))
    })
  }, [])
  return (
    <div className="shadow-xl p-4 max-w-md">
      {sheet.length == 0 && <Logo/>}
      <form onSubmit={handleSearch} className={"flex flex-row w-full justify-center"}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value.toUpperCase())}
          placeholder="Feed me vin no. column"
          className="px-4 bg-green-50 text-green-600 placeholder-stone-400 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all cursor-pointer"
        />
        <button
          type="submit"
          disabled={loading || !search.trim()}
          className="bg-lime-600 ml-2 p-3 hover:bg-lime-700 text-lime-100 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                if (e.currentTarget.id == "hibiscus-commercial") setApi("service-cv")
                else setApi("service")
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
          className={`py-2 shadow-lg ${option.color} opacity-70 cursor-pointer text-green-100 font-mono mr-2 px-2 h-min text-nowrap`}>
          {option.title}
        </button>)}
      </div>
      {sheet.length > 0 && <div className="mt-2">
        <div className="backdrop-brightness-60 max-h-[300px] overflow-auto backdrop-contrast-125 font-mono border-1 border-stone-400 rounded-md p-2">
          <Spreadsheet data={sheet} columnLabels={["VIN Number", "KYC", "SignUp", "Customer"]}/>
        </div>
      </div>}
      {exception && <div className="text-sm font-mono mt-3 p-3 flex flex-row text-red-500 font-bold bg-red-100 border-1 rounded-md">
        <Info className="mr-1 size-4"/>
        {exception}
      </div>}
    </div>
  )
}
