import { Logo } from "../components";

export default function App() {
  return (
    <div className="py-12 flex flex-col justify-center items-center">
      <Logo/>
      <div className="p-10 backdrop-brightness-70 backdrop-contrast-125 border-1 border-stone-400 rounded-md">
        <h1 className="text-2xl font-bold text-lime-400">
          Waiting for Request
        </h1>
        <p className="text-lime-100 text-center">
          Visit KYC portal and search a vin no...
        </p>
      </div>
    </div>
  )
}
