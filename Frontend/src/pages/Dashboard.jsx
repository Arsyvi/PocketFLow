import { useEffect, useState } from "react";
import Header from "../components/dashboard/Header";
import Pocketlist from "../components/dashboard/Pocketlist";
import Weekly from "../components/dashboard/Weekly";
import Recent from "../components/dashboard/Recent";
import IncomeForm from "./IncomeForm"
import ExpenseForm from "./ExpenseForm";
import { usePockets } from "../hooks/usePockets";

function Dashboard() {
    const { pockets, loading: loadingPockets, refresh: refreshPockets } = usePockets()
    const [View,setView] = useState("dashboard")

    // Refresh diam-diam tiap kembali ke dashboard (habis catat transaksi)
    useEffect(() => {
        if (View !== "dashboard") return;
        refreshPockets().catch(() => {});
    }, [View, refreshPockets])

    const totalAmount = pockets.reduce((sum, pocket) => sum + Number(pocket.balance ?? 0), 0)

    if (View === "income") {
        return <IncomeForm onBack={() => setView("dashboard")} />
    }

    if (View === "expense") {
        return <ExpenseForm onBack={() => setView("dashboard")} />
    }

    return(
     <div className="dashboard">
     <Header totalAmount={totalAmount} onOpenIncome={() => setView("income")} onOpenExpense={()=> setView("expense")} />
        <Pocketlist pockets={pockets} loading={loadingPockets} />
        <div className="card-group">
            <Weekly />
            <Recent onOpenIncome={() => setView("income")} />
        </div>
     </div>
    )
}

export default Dashboard;
